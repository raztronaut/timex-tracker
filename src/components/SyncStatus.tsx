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
    <div className="flex flex-wrap items-center gap-4 bg-card/50 p-2 px-3.5 rounded-lg border border-card-border shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-4 text-xs text-muted" aria-live="polite">
        {/* Status dot */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              syncing 
                ? "bg-amber-500 animate-pulse" 
                : "bg-emerald-500"
            }`}
          />
          <span className="font-semibold text-foreground">
            {syncing ? "Syncing..." : "Online"}
          </span>
        </div>

        {/* Divider */}
        <span className="h-3 w-px bg-card-border/80" />

        <span>
          <strong className="font-semibold tabular-nums text-foreground">
            {candidateCount}
          </strong>{" "}
          candidates
        </span>

        {/* Divider */}
        <span className="h-3 w-px bg-card-border/80" />

        <span>
          <strong className="font-semibold tabular-nums text-foreground">
            {totalListings}
          </strong>{" "}
          total
        </span>

        {lastSyncAt && (
          <>
            {/* Divider */}
            <span className="h-3 w-px bg-card-border/80" />
            <span className="flex items-center gap-1 text-muted">
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
        variant="secondary"
        onClick={handleSync}
        disabled={syncing}
        aria-busy={syncing}
        className="group pl-2.5 pr-3.5 ml-auto md:ml-0 font-semibold"
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
