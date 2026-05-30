"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { SyncStatus } from "./SyncStatus";
import { ReferenceCollection } from "./ReferenceCollection";
import { FilterBar, ListingGrid, ListingDrawer, ShowcaseView } from "@/features/listings";
import { useListings } from "@/hooks/useListings";
import { useSync } from "@/hooks/useSync";
import type { Listing } from "@/lib/types";
import type { SyncStatus as SyncStatusData } from "@/lib/sync-status";
import { Sun, Moon, LayoutGrid, Sparkles } from "lucide-react";

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

  // Premium Showcase Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // View mode switcher: Defaulting to standard Grid View
  const [viewMode, setViewMode] = useState<"showcase" | "grid">("grid");

  // Sync theme selection from localStorage or client OS preference asynchronously after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem("timex-theme") as "light" | "dark";
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        setTheme(prefersLight ? "light" : "dark");
      }

      const savedView = localStorage.getItem("timex-view-mode") as "showcase" | "grid";
      if (savedView) {
        setViewMode(savedView);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Update root element HTML classes for theme variables
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("timex-theme", theme);
  }, [theme]);

  const handleViewModeChange = useCallback((mode: "showcase" | "grid") => {
    setViewMode(mode);
    setSelected(null);
    localStorage.setItem("timex-view-mode", mode);
  }, []);

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
    <div
      className={`w-full bg-background text-foreground transition-colors duration-300 flex flex-col ${
        viewMode === "showcase"
          ? "min-h-screen md:h-screen md:overflow-hidden p-6 md:p-8 max-w-7xl mx-auto"
          : "min-h-screen mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      }`}
    >
      {/* Unified Premium Header */}
      <header className="w-full flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 shrink-0 relative">
        {/* Left: View mode toggles and theme switch */}
        <div className="flex items-center gap-2 z-10">
          <div className="flex rounded-xl bg-card p-0.5 border border-card-border shadow-[var(--shadow-border)]">
            <button
              onClick={() => handleViewModeChange("showcase")}
              title="Showcase Mode"
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.96] flex items-center gap-1.5 cursor-pointer border ${
                viewMode === "showcase"
                  ? "bg-background border-card-border/60 text-foreground shadow-sm font-bold"
                  : "text-muted hover:text-foreground border-transparent"
              }`}
            >
              <Sparkles size={11} className={viewMode === "showcase" ? "text-amber-500 fill-amber-500/10" : ""} />
              Showcase
            </button>
            <button
              onClick={() => handleViewModeChange("grid")}
              title="Grid Mode"
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.96] flex items-center gap-1.5 cursor-pointer border ${
                viewMode === "grid"
                  ? "bg-background border-card-border/60 text-foreground shadow-sm font-bold"
                  : "text-muted hover:text-foreground border-transparent"
              }`}
            >
              <LayoutGrid size={11} />
              Grid View
            </button>
          </div>

          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="rounded-lg border border-card-border bg-card p-2.5 text-muted hover:text-foreground hover:bg-card-border/30 active:scale-[0.96] transition-all cursor-pointer shadow-sm"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
          </button>
        </div>

        {/* Center: spaced TIMEX tracker logo */}
        <div className="text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 select-none">
          <h1 className="font-sans text-sm font-extrabold tracking-[0.35em] text-foreground uppercase">
            TIMEX
          </h1>
          <p className="text-[8px] tracking-[0.25em] text-muted uppercase mt-0.5 font-bold">
            Tracker
          </p>
        </div>

        {/* Right: SyncStatus capsule */}
        <div className="z-10">
          <SyncStatus
            totalListings={totalListings}
            candidateCount={candidateCount}
            lastSyncAt={lastSyncAt}
            syncing={syncing}
            onSync={sync}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-0">
        {viewMode === "showcase" ? (
          <ShowcaseView
            listings={listings}
            loading={loading}
            pending={isPending}
            selected={selected}
            onSelect={setSelected}
            filter={filter}
            filterBar={
              <FilterBar
                filter={filter}
                sort={sort}
                source={source}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onSourceChange={handleSourceChange}
              />
            }
          />
        ) : (
          <div className="space-y-6">
            <ReferenceCollection />
            
            {/* Filter and Sort controls sticky bar */}
            <div className="sticky top-0 z-30 -mx-4 bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-card-border/20">
              <FilterBar
                filter={filter}
                sort={sort}
                source={source}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onSourceChange={handleSourceChange}
              />
            </div>

            <div>
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
          </div>
        )}
      </main>

      {/* Unified Immersive Footer */}
      <footer className="w-full flex justify-between items-center text-[9px] text-muted/75 uppercase tracking-widest pt-3 border-t border-card-border/40 mt-6 shrink-0">
        <span>Timex Collector Hub © 2026</span>
        <div className="flex items-center gap-4 font-bold">
          <button className="hover:text-foreground transition-colors cursor-pointer">Share Site</button>
          <button className="hover:text-foreground transition-colors cursor-pointer">Submit Feedback</button>
        </div>
      </footer>
    </div>
  );
}
