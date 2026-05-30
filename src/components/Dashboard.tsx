"use client";

import { useState, useCallback, useTransition } from "react";
import { SyncStatus } from "./SyncStatus";
import { ReferenceCollection } from "./ReferenceCollection";
import { FilterBar, ListingGrid, ListingDrawer } from "@/features/listings";
import { useListings } from "@/hooks/useListings";
import { useSync } from "@/hooks/useSync";
import type { Listing } from "@/lib/types";
import type { SyncStatus as SyncStatusData } from "@/lib/sync-status";

interface DashboardProps {
  initialListings: Listing[];
  initialTotal: number;
  initialSyncStatus: SyncStatusData;
}

export function Dashboard({
  initialListings,
  initialTotal,
  initialSyncStatus,
}: DashboardProps) {
  const [selected, setSelected] = useState<Listing | null>(null);
  const [filter, setFilter] = useState("candidates");
  const [sort, setSort] = useState("interest_score");
  const [source, setSource] = useState("");
  const [isPending, startTransition] = useTransition();

  const { listings, total, loading, refresh } = useListings({
    filter,
    sort,
    source,
    initialListings,
    initialTotal,
  });
  const { syncing, totalListings, candidateCount, lastSyncAt, sync } =
    useSync(refresh, initialSyncStatus);
  const handleClose = useCallback(() => setSelected(null), []);

  const handleFilterChange = useCallback(
    (f: string) => startTransition(() => setFilter(f)),
    [],
  );
  const handleSortChange = useCallback(
    (s: string) => startTransition(() => setSort(s)),
    [],
  );
  const handleSourceChange = useCallback(
    (s: string) => startTransition(() => setSource(s)),
    [],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
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
            onSync={sync}
          />
        </div>
        <div className="mt-4">
          <ReferenceCollection />
        </div>
      </header>

      <div className="sticky top-0 z-30 -mx-4 bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <FilterBar
          filter={filter}
          sort={sort}
          source={source}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onSourceChange={handleSourceChange}
        />
      </div>

      <ListingGrid
        listings={listings}
        total={total}
        loading={loading}
        pending={isPending}
        onSelect={setSelected}
        onSync={sync}
        syncing={syncing}
        filter={filter}
      />

      <ListingDrawer listing={selected} onClose={handleClose} />
    </div>
  );
}
