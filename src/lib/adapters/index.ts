import type { ListingAdapter } from "../types";
import { ebayAdapter } from "./ebay";
import { etsyAdapter } from "./etsy";
import { chrono24Adapter } from "./chrono24";
import { sampleAdapter } from "./sample";

export const adapters: ListingAdapter[] = [
  ebayAdapter,
  etsyAdapter,
  chrono24Adapter,
  sampleAdapter,
];

export function getAdapter(source: string): ListingAdapter | undefined {
  return adapters.find((a) => a.source === source);
}
