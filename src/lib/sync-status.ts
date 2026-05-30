import { getServiceClient } from "./supabase";
import type { SyncRun, ListingSource } from "./types";

interface SyncRunRow {
  id: string;
  started_at: string;
  finished_at: string | null;
  source: string;
  found: number;
  inserted: number;
  updated: number;
  errors: number;
  adapter_error?: string | null;
}

export function syncRunFromRow(row: SyncRunRow): SyncRun {
  return {
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    source: row.source as ListingSource,
    found: row.found,
    inserted: row.inserted,
    updated: row.updated,
    errors: row.errors,
    adapterError: row.adapter_error,
  };
}

export interface SyncStatus {
  recentRuns: SyncRun[];
  totalListings: number;
  candidateCount: number;
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const db = getServiceClient();

  const [runsResult, totalResult, candidateResult] = await Promise.all([
    db.from("sync_runs").select("*").order("started_at", { ascending: false }).limit(10),
    db.from("listings").select("*", { count: "exact", head: true }),
    db.from("listings").select("*", { count: "exact", head: true }).eq("is_candidate", true),
  ]);

  return {
    recentRuns: (runsResult.data || []).map(syncRunFromRow),
    totalListings: totalResult.count || 0,
    candidateCount: candidateResult.count || 0,
  };
}
