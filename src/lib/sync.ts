import { getServiceClient } from "./supabase";
import { liveAdapters, sampleAdapter } from "./adapters";
import { normalize, passesRules } from "./normalize";
import { scoreListingsBatch } from "./scorer";
import { toScoredRow, toExcludedRow, upsertListing } from "./listings";
import type { ListingAdapter, ListingSource } from "./types";

export interface SyncResult {
  source: ListingSource;
  found: number;
  passed: number;
  excluded: number;
  errors: number;
  adapterError?: string;
  durationMs: number;
}

async function syncAdapter(
  adapter: ListingAdapter,
  query: string
): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = {
    source: adapter.source,
    found: 0,
    passed: 0,
    excluded: 0,
    errors: 0,
    durationMs: 0,
  };

  const db = getServiceClient();

  const { data: runData } = await db
    .from("sync_runs")
    .insert({ source: adapter.source })
    .select("id")
    .single();

  const runId = runData?.id;

  try {
    const adapterResult = await adapter.fetchListings(query);

    if (adapterResult.error) {
      result.adapterError = adapterResult.error;
      result.errors++;
    }

    const rawListings = adapterResult.listings;
    result.found = rawListings.length;

    if (rawListings.length === 0) {
      await finishRun(db, runId, result);
      result.durationMs = Date.now() - start;
      return result;
    }

    const normalized = rawListings.map(normalize);

    const passing = normalized.filter(passesRules);
    const failing = normalized.filter((l) => !passesRules(l));

    let scores: Awaited<ReturnType<typeof scoreListingsBatch>> = [];
    if (passing.length > 0) {
      scores = await scoreListingsBatch(passing);
    }

    for (let i = 0; i < passing.length; i++) {
      const row = toScoredRow(passing[i], scores[i]);
      const { error } = await upsertListing(row);
      if (error) {
        console.error("Upsert error:", error);
        result.errors++;
      } else {
        result.passed++;
      }
    }

    for (const listing of failing) {
      const row = toExcludedRow(listing);
      const { error } = await upsertListing(row);
      if (error) {
        result.errors++;
      } else {
        result.excluded++;
      }
    }
  } catch (err) {
    console.error(`Adapter ${adapter.source} failed:`, err);
    result.adapterError = String(err);
    result.errors++;
  }

  await finishRun(db, runId, result);
  result.durationMs = Date.now() - start;
  return result;
}

async function finishRun(
  db: ReturnType<typeof getServiceClient>,
  runId: string | undefined,
  result: SyncResult,
) {
  if (!runId) return;
  await db
    .from("sync_runs")
    .update({
      finished_at: new Date().toISOString(),
      found: result.found,
      inserted: result.passed,
      updated: result.excluded,
      errors: result.errors,
      adapter_error: result.adapterError ?? null,
    })
    .eq("id", runId);
}

export async function runFullSync(query = "timex watch"): Promise<SyncResult[]> {
  // Run adapters sequentially — parallel Olostep scrapes risk hitting the
  // Vercel function timeout (~120s) since each scrape can take up to 55s.
  const results: SyncResult[] = [];
  for (const adapter of liveAdapters) {
    try {
      results.push(await syncAdapter(adapter, query));
    } catch (err) {
      results.push({
        source: adapter.source,
        found: 0,
        passed: 0,
        excluded: 0,
        errors: 1,
        adapterError: String(err),
        durationMs: 0,
      });
    }
  }

  const totalFound = results.reduce((sum, r) => sum + r.found, 0);
  const anyAdapterError = results.some((r) => !!r.adapterError);

  // When live adapters find listings, purge stale demo data.
  if (totalFound > 0) {
    const db = getServiceClient();
    await db.from("listings").delete().eq("source", "sample");
  }

  // Only fall back to sample data when all live adapters returned zero listings
  // AND none of them reported an error (genuine "nothing available" vs failure).
  if (totalFound === 0 && !anyAdapterError) {
    const fallback = await syncAdapter(sampleAdapter, query);
    results.push(fallback);
  }

  return results;
}
