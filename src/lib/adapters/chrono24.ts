import type { ListingAdapter, AdapterResult } from "../types";

export const chrono24Adapter: ListingAdapter = {
  source: "chrono24",

  async fetchListings(_query: string): Promise<AdapterResult> {
    // Chrono24 has no public API and aggressively blocks automated requests.
    // This adapter is a stub — returns empty with no error (not a failure).
    return { listings: [] };
  },
};
