import type { ListingAdapter, RawListing } from "../types";

export const chrono24Adapter: ListingAdapter = {
  source: "chrono24",

  async fetchListings(_query: string): Promise<RawListing[]> {
    // Chrono24 has no public API and aggressively blocks automated requests.
    // This adapter is a stub that returns an empty array. When a public API
    // becomes available, implement it here following the same interface.
    console.log("Chrono24: stub adapter, no public API available — returning []");
    return [];
  },
};
