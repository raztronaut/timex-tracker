"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SyncStatus } from "@/lib/sync-status";

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
      } else {
        refreshStatus();
        onSyncComplete?.();
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }, [refreshStatus, onSyncComplete]);

  return { syncing, totalListings, candidateCount, lastSyncAt, sync, refreshStatus };
}
