"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SyncStatus } from "@/lib/sync-status";

export interface SyncWarning {
  source: string;
  message: string;
}

export function useSync(
  onSyncComplete?: () => void,
  initialStatus?: SyncStatus,
) {
  const [syncing, setSyncing] = useState(false);
  const [totalListings, setTotalListings] = useState(
    initialStatus?.totalListings ?? 0,
  );
  const [candidateCount, setCandidateCount] = useState(
    initialStatus?.candidateCount ?? 0,
  );
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(
    initialStatus?.recentRuns?.[0]?.finishedAt ?? null,
  );
  const [syncWarnings, setSyncWarnings] = useState<SyncWarning[]>([]);
  const [version, setVersion] = useState(0);
  const skipInitialFetch = useRef(!!initialStatus);

  const refreshStatus = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (skipInitialFetch.current && version === 0) {
      skipInitialFetch.current = false;
      return;
    }
    skipInitialFetch.current = false;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/sync-status");
        if (cancelled) return;
        const data = await res.json();
        setTotalListings(data.totalListings);
        setCandidateCount(data.candidateCount);
        if (data.recentRuns?.[0]?.finishedAt) {
          setLastSyncAt(data.recentRuns[0].finishedAt);
        }
      } catch (err) {
        console.error("Failed to load sync status:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [version]);

  const sync = useCallback(async () => {
    setSyncing(true);
    setSyncWarnings([]);
    try {
      const headers: Record<string, string> = {};
      const secret = process.env.NEXT_PUBLIC_SYNC_SECRET;
      if (secret) {
        headers["Authorization"] = `Bearer ${secret}`;
      }
      const res = await fetch("/api/sync", { method: "POST", headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Sync rejected:", res.status, body.error ?? "");
        setSyncWarnings([{ source: "sync", message: body.error ?? `HTTP ${res.status}` }]);
      } else {
        const body = await res.json().catch(() => ({ results: [] }));
        const warnings: SyncWarning[] = [];
        for (const r of body.results ?? []) {
          if (r.adapterError) {
            warnings.push({ source: r.source, message: r.adapterError });
          }
        }
        const usedDemo = (body.results ?? []).some(
          (r: { source: string }) => r.source === "sample",
        );
        if (usedDemo) {
          warnings.push({
            source: "sync",
            message: "Used demo data — no live listings found",
          });
        }
        setSyncWarnings(warnings);
        refreshStatus();
        onSyncComplete?.();
      }
    } catch (err) {
      console.error("Sync failed:", err);
      setSyncWarnings([{ source: "sync", message: String(err) }]);
    } finally {
      setSyncing(false);
    }
  }, [refreshStatus, onSyncComplete]);

  return {
    syncing,
    totalListings,
    candidateCount,
    lastSyncAt,
    syncWarnings,
    sync,
    refreshStatus,
  };
}
