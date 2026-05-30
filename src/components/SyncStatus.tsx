"use client";

import { RefreshCw, AlertTriangle } from "lucide-react";

interface SyncStatusProps {
  totalListings: number;
  candidateCount: number;
  lastSyncAt: string | null;
  syncing: boolean;
  onSync: () => void;
}

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

function isOnCooldown(lastSyncAt: string | null): boolean {
  if (!lastSyncAt) return false;
  return Date.now() - new Date(lastSyncAt).getTime() < COOLDOWN_MS;
}

function formatTimeSince(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-CA", {
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
        "You synced less than 1 hour ago. Each sync uses Olostep API credits.\n\nSync again anyway?"
      );
      if (!ok) return;
    }
    onSync();
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-6 text-sm text-muted">
        <span>
          <strong className="text-foreground">{candidateCount}</strong> candidates
        </span>
        <span>
          <strong className="text-foreground">{totalListings}</strong> total
        </span>
        {lastSyncAt && (
          <span className="flex items-center gap-1">
            {cooldown && <AlertTriangle size={12} className="text-amber-500" />}
            Synced {formatTimeSince(lastSyncAt)}
          </span>
        )}
      </div>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
      >
        <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Syncing..." : "Sync Now"}
      </button>
    </div>
  );
}
