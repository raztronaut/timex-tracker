import type { RawListing, Listing } from "./types";
import { toCad } from "./currency";
import { isBroken } from "./condition";

export function normalize(raw: RawListing): Omit<
  Listing,
  | "id"
  | "interestScore"
  | "interestTags"
  | "interestRationale"
  | "isCandidate"
  | "firstSeenAt"
  | "lastSeenAt"
> {
  const shippingCad = raw.shippingCost != null ? toCad(raw.shippingCost, raw.currency) : 0;
  const priceCad = toCad(raw.price, raw.currency);
  const totalCostCad = Math.round((priceCad + shippingCad) * 100) / 100;

  return {
    source: raw.source,
    sourceId: raw.sourceId,
    url: raw.url,
    title: raw.title,
    price: raw.price,
    currency: raw.currency,
    shippingCost: raw.shippingCost,
    totalCostCad,
    conditionRaw: raw.conditionRaw,
    isBroken: isBroken(raw.conditionRaw, raw.title),
    images: raw.images,
    location: raw.location,
    listedAt: raw.listedAt,
  };
}

export const MAX_TOTAL_COST_CAD = 50;

export function passesRules(listing: { totalCostCad: number; isBroken: boolean }): boolean {
  return listing.totalCostCad <= MAX_TOTAL_COST_CAD && !listing.isBroken;
}
