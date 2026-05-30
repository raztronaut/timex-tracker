import { getServiceClient } from "./supabase";
import { adapters } from "./adapters";
import { normalize, passesRules } from "./normalize";
import { scoreListingsBatch } from "./scorer";
import type { ListingAdapter, ListingSource } from "./types";

const CANDIDATE_THRESHOLD = 55;

export interface SyncResult {
  source: ListingSource;
  found: number;
  inserted: number;
  updated: number;
  errors: number;
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
    inserted: 0,
    updated: 0,
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
    const rawListings = await adapter.fetchListings(query);
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
      const listing = passing[i];
      const score = scores[i];

      try {
        const { error } = await db.from("listings").upsert(
          {
            source: listing.source,
            source_id: listing.sourceId,
            url: listing.url,
            title: listing.title,
            price: listing.price,
            currency: listing.currency,
            shipping_cost: listing.shippingCost,
            total_cost_cad: listing.totalCostCad,
            condition_raw: listing.conditionRaw,
            is_broken: listing.isBroken,
            images: listing.images,
            location: listing.location,
            listed_at: listing.listedAt,
            interest_score: score.score,
            interest_tags: score.tags,
            interest_rationale: score.rationale,
            is_candidate: score.score >= CANDIDATE_THRESHOLD,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "source,source_id" }
        );

        if (error) {
          console.error("Upsert error:", error);
          result.errors++;
        } else {
          result.inserted++;
        }
      } catch (err) {
        console.error("Row upsert failed:", err);
        result.errors++;
      }
    }

    for (const listing of failing) {
      try {
        const { error } = await db.from("listings").upsert(
          {
            source: listing.source,
            source_id: listing.sourceId,
            url: listing.url,
            title: listing.title,
            price: listing.price,
            currency: listing.currency,
            shipping_cost: listing.shippingCost,
            total_cost_cad: listing.totalCostCad,
            condition_raw: listing.conditionRaw,
            is_broken: listing.isBroken,
            images: listing.images,
            location: listing.location,
            listed_at: listing.listedAt,
            interest_score: null,
            interest_tags: [],
            interest_rationale: listing.isBroken
              ? "Excluded: item appears broken"
              : "Excluded: over $50 CAD total cost",
            is_candidate: false,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "source,source_id" }
        );

        if (error) {
          result.errors++;
        } else {
          result.updated++;
        }
      } catch {
        result.errors++;
      }
    }
  } catch (err) {
    console.error(`Adapter ${adapter.source} failed:`, err);
    result.errors++;
  }

  await finishRun(db, runId, result);
  result.durationMs = Date.now() - start;
  return result;
}

async function finishRun(
  db: ReturnType<typeof getServiceClient>,
  runId: string | undefined,
  result: SyncResult
) {
  if (!runId) return;
  await db
    .from("sync_runs")
    .update({
      finished_at: new Date().toISOString(),
      found: result.found,
      inserted: result.inserted,
      updated: result.updated,
      errors: result.errors,
    })
    .eq("id", runId);
}

export async function runFullSync(query = "timex watch"): Promise<SyncResult[]> {
  const results = await Promise.allSettled(
    adapters.map((adapter) => syncAdapter(adapter, query))
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          source: adapters[i].source,
          found: 0,
          inserted: 0,
          updated: 0,
          errors: 1,
          durationMs: 0,
        }
  );
}
