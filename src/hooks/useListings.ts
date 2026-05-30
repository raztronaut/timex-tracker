"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Listing } from "@/lib/types";

interface UseListingsOptions {
  filter: string;
  sort: string;
  source: string;
  initialListings?: Listing[];
  initialTotal?: number;
}

const DEFAULT_FILTER = "candidates";
const DEFAULT_SORT = "interest_score";

function isDefaultParams(filter: string, sort: string, source: string) {
  return filter === DEFAULT_FILTER && sort === DEFAULT_SORT && source === "";
}

export function useListings({
  filter,
  sort,
  source,
  initialListings,
  initialTotal,
}: UseListingsOptions) {
  const [listings, setListings] = useState<Listing[]>(initialListings ?? []);
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [loading, setLoading] = useState(!initialListings);
  const [version, setVersion] = useState(0);
  const skipInitialFetch = useRef(!!initialListings);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (skipInitialFetch.current && isDefaultParams(filter, sort, source) && version === 0) {
      skipInitialFetch.current = false;
      return;
    }
    skipInitialFetch.current = false;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ filter, sort });
        if (source) params.set("source", source);

        const res = await fetch(`/api/listings?${params}`);
        if (cancelled) return;

        const data = await res.json();
        setListings(data.listings || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filter, sort, source, version]);

  return { listings, total, loading, refresh };
}
