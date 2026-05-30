import type { Listing, ListingSource, NormalizedListing, InterestResult } from "./types";
import { CANDIDATE_THRESHOLD } from "./normalize";
import { getServiceClient } from "./supabase";

/** Snake-case shape matching the `listings` table in Supabase. */
interface ListingRow {
  id: string;
  source: string;
  source_id: string;
  url: string;
  title: string;
  price: number;
  currency: string;
  shipping_cost: number | null;
  total_cost_cad: number;
  condition_raw: string;
  is_broken: boolean;
  images: string[];
  location: string | null;
  listed_at: string | null;
  interest_score: number | null;
  interest_tags: string[];
  interest_rationale: string | null;
  is_candidate: boolean;
  first_seen_at: string;
  last_seen_at: string;
}

type InsertRow = Omit<ListingRow, "id" | "first_seen_at">;

export function fromRow(row: ListingRow): Listing {
  return {
    id: row.id,
    source: row.source as ListingSource,
    sourceId: row.source_id,
    url: row.url,
    title: row.title,
    price: row.price,
    currency: row.currency,
    shippingCost: row.shipping_cost,
    totalCostCad: row.total_cost_cad,
    conditionRaw: row.condition_raw,
    isBroken: row.is_broken,
    images: row.images || [],
    location: row.location,
    listedAt: row.listed_at,
    interestScore: row.interest_score,
    interestTags: row.interest_tags || [],
    interestRationale: row.interest_rationale,
    isCandidate: row.is_candidate,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
  };
}

function toBaseRow(listing: NormalizedListing): Omit<InsertRow, "interest_score" | "interest_tags" | "interest_rationale" | "is_candidate"> {
  return {
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
    last_seen_at: new Date().toISOString(),
  };
}

export function toScoredRow(listing: NormalizedListing, score: InterestResult): InsertRow {
  return {
    ...toBaseRow(listing),
    interest_score: score.score,
    interest_tags: score.tags,
    interest_rationale: score.rationale,
    is_candidate: score.score >= CANDIDATE_THRESHOLD,
  };
}

export function toExcludedRow(listing: NormalizedListing): InsertRow {
  return {
    ...toBaseRow(listing),
    interest_score: null,
    interest_tags: [],
    interest_rationale: listing.isBroken
      ? "Excluded: item appears broken"
      : "Excluded: over $50 CAD total cost",
    is_candidate: false,
  };
}

export async function upsertListing(row: InsertRow) {
  const db = getServiceClient();
  const { error } = await db
    .from("listings")
    .upsert(row, { onConflict: "source,source_id" });
  return { error };
}

export async function queryListings(opts: {
  filter: string;
  sort: string;
  source?: string;
  limit: number;
  offset: number;
}) {
  const db = getServiceClient();
  let query = db.from("listings").select("*", { count: "exact" });

  if (opts.filter === "candidates") {
    query = query.eq("is_candidate", true);
  } else if (opts.filter === "excluded") {
    query = query.eq("is_candidate", false);
  }

  if (opts.source) {
    query = query.eq("source", opts.source);
  }

  const sortColumn = ["interest_score", "total_cost_cad", "last_seen_at", "price"].includes(opts.sort)
    ? opts.sort
    : "interest_score";

  const ascending = sortColumn === "total_cost_cad" || sortColumn === "price";

  query = query
    .order(sortColumn, { ascending, nullsFirst: false })
    .range(opts.offset, opts.offset + opts.limit - 1);

  const { data, error, count } = await query;
  if (error) return { listings: [], total: 0, error };
  return { listings: (data || []).map(fromRow), total: count ?? 0, error: null };
}
