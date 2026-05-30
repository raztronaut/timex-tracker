"use client";

import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "./ui";

interface SyncStatusProps {
  totalListings: number;
  candidateCount: number;
  lastSyncAt: string | null;
  syncing: boolean;
  onSync: () => void;
}

const COOLDOWN_MS = 60 * 60 * 1000;

function isOnCooldown(lastSyncAt: string | null): boolean {
  if (!lastSyncAt) return false;
  return Date.now() - new Date(lastSyncAt).getTime() < COOLDOWN_MS;
}

function formatTimeSince(dateStr: string): string {
  const mins = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 60000,
  );
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function SyncStatus({
  totalListings,
  candidateCount,
  lastSyncAt,
  syncing,
  onSync,
}: SyncStatusProps) {
  const cooldown = isOnCooldown(lastSyncAt);

  const handleSync = () => {
    if (cooldown) {
      const ok = window.confirm(
        "You synced less than 1 hour ago. Each sync uses Olostep API credits.\n\nSync again anyway?",
      );
      if (!ok) return;
    }
    onSync();
  };

  return (
    <div className="flex flex-wrap items-center gap-4 bg-zinc-900/30 p-2 px-3.5 rounded-lg border border-zinc-800/80 shadow-sm">
      <div className="flex items-center gap-4 text-xs text-zinc-400" aria-live="polite">
        {/* Status dot */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              syncing 
                ? "bg-amber-500 animate-pulse" 
                : "bg-emerald-500"
            }`}
          />
          <span className="font-semibold text-zinc-300">
            {syncing ? "Syncing..." : "Online"}
          </span>
        </div>

        {/* Divider */}
        <span className="h-3 w-px bg-zinc-800" />

        <span>
          <strong className="font-semibold tabular-nums text-zinc-100">
            {candidateCount}
          </strong>{" "}
          candidates
        </span>

        {/* Divider */}
        <span className="h-3 w-px bg-zinc-800" />

        <span>
          <strong className="font-semibold tabular-nums text-zinc-100">
            {totalListings}
          </strong>{" "}
          total
        </span>

        {lastSyncAt && (
          <>
            {/* Divider */}
            <span className="h-3 w-px bg-zinc-800" />
            <span className="flex items-center gap-1 text-zinc-400">
              {cooldown ? (
                <AlertTriangle size={12} className="text-amber-500" />
              ) : (
                <CheckCircle size={12} className="text-emerald-500" />
              )}
              Synced {formatTimeSince(lastSyncAt)}
            </span>
          </>
        )}
      </div>

      <Button
        onClick={handleSync}
        disabled={syncing}
        aria-busy={syncing}
        className="group relative flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 hover:text-zinc-100 active:scale-[0.96] transition-[border-color,background-color,color] pl-2.5 pr-3.5 ml-auto md:ml-0"
      >
        <RefreshCw 
          size={12} 
          className={`transition-transform duration-500 ${
            syncing ? "animate-spin" : "group-hover:rotate-180"
          }`} 
        />
        <span>{syncing ? "Syncing..." : "Sync Now"}</span>
      </Button>
    </div>
  );
}
