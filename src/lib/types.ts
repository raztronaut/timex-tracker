export type ListingSource = "ebay" | "etsy" | "chrono24" | "sample";

export interface RawListing {
  source: ListingSource;
  sourceId: string;
  url: string;
  title: string;
  price: number;
  currency: string;
  shippingCost: number | null;
  conditionRaw: string;
  images: string[];
  location: string | null;
  listedAt: string | null;
}

export interface Listing {
  id: string;
  source: ListingSource;
  sourceId: string;
  url: string;
  title: string;
  price: number;
  currency: string;
  shippingCost: number | null;
  totalCostCad: number;
  conditionRaw: string;
  isBroken: boolean;
  images: string[];
  location: string | null;
  listedAt: string | null;
  interestScore: number | null;
  interestTags: string[];
  interestRationale: string | null;
  isCandidate: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface SyncRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  source: ListingSource;
  found: number;
  inserted: number;
  updated: number;
  errors: number;
  adapterError?: string | null;
}

export interface NormalizedListing {
  source: ListingSource;
  sourceId: string;
  url: string;
  title: string;
  price: number;
  currency: string;
  shippingCost: number | null;
  shippingUnknown: boolean;
  totalCostCad: number;
  conditionRaw: string;
  isBroken: boolean;
  images: string[];
  location: string | null;
  listedAt: string | null;
}

export interface AdapterResult {
  listings: RawListing[];
  error?: string;
}

export interface ListingAdapter {
  source: ListingSource;
  fetchListings(query: string): Promise<AdapterResult>;
}

export interface InterestResult {
  score: number;
  tags: string[];
  rationale: string;
}
