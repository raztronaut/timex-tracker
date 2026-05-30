"use client";

import { useState, useEffect, useCallback } from "react";
import { ListingCard } from "./ListingCard";
import { ListingDrawer } from "./ListingDrawer";
import { FilterBar } from "./FilterBar";
import { SyncStatus } from "./SyncStatus";
import { ReferenceCollection } from "./ReferenceCollection";
import type { Listing } from "@/lib/types";

interface DbListing {
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

function toClientListing(row: DbListing): Listing {
  return {
    id: row.id,
    source: row.source as Listing["source"],
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

export function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);

  const [filter, setFilter] = useState("candidates");
  const [sort, setSort] = useState("interest_score");
  const [source, setSource] = useState("");

  const [totalListings, setTotalListings] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter, sort });
      if (source) params.set("source", source);

      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();

      setListings((data.listings || []).map(toClientListing));
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, sort, source]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/sync-status");
      const data = await res.json();
      setTotalListings(data.totalListings);
      setCandidateCount(data.candidateCount);
      if (data.recentRuns?.[0]?.finished_at) {
        setLastSyncAt(data.recentRuns[0].finished_at);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchListings();
    fetchStatus();
  }, [fetchListings, fetchStatus]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      await fetchListings();
      await fetchStatus();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Timex Tracker
            </h1>
            <p className="mt-1 text-sm text-muted">
              AI-scored vintage Timex listings from eBay, Etsy &amp; more
            </p>
          </div>
          <SyncStatus
            totalListings={totalListings}
            candidateCount={candidateCount}
            lastSyncAt={lastSyncAt}
            syncing={syncing}
            onSync={handleSync}
          />
        </div>

        <div className="mt-4">
          <ReferenceCollection />
          <FilterBar
            filter={filter}
            sort={sort}
            source={source}
            onFilterChange={setFilter}
            onSortChange={setSort}
            onSourceChange={setSource}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
            <p className="text-sm">Loading listings...</p>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-stone-300 mb-3"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3 className="text-lg font-medium text-stone-700">No listings found</h3>
          <p className="mt-1 text-sm text-muted max-w-sm">
            {filter === "candidates"
              ? "No candidates yet. Try syncing or check all listings."
              : "Hit Sync Now to pull listings from marketplaces."}
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted">
            Showing {listings.length} of {total} listings
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={setSelected}
              />
            ))}
          </div>
        </>
      )}

      <ListingDrawer listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
