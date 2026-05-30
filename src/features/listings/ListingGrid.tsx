"use client";

import { ListingCard, ListingCardSkeleton } from "./ListingCard";
import { Button } from "@/components/ui";
import type { Listing } from "@/lib/types";

interface ListingGridProps {
  listings: Listing[];
  total: number;
  loading: boolean;
  pending?: boolean;
  onSelect: (listing: Listing) => void;
  onSync: () => void;
  syncing: boolean;
  filter: string;
}

export function ListingGrid({
  listings,
  total,
  loading,
  pending,
  onSelect,
  onSync,
  syncing,
  filter,
}: ListingGridProps) {
  if (loading && listings.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="mb-3 text-stone-300"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <h3 className="font-serif text-lg font-medium text-stone-700">
          No listings found
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted">
          {filter === "candidates"
            ? "No candidates yet. Try syncing or check all listings."
            : "Hit Sync Now to pull listings from marketplaces."}
        </p>
        <Button onClick={onSync} disabled={syncing} className="mt-4">
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-xs text-muted">
        Showing {listings.length} of {total} listings
      </p>
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-150 ${
          pending || loading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {listings.map((listing, i) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onSelect={onSelect}
            index={i}
          />
        ))}
      </div>
    </>
  );
}
