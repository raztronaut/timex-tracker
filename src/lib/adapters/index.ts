import type { ListingAdapter } from "../types";
import { ebayAdapter } from "./ebay";
import { etsyAdapter } from "./etsy";
import { chrono24Adapter } from "./chrono24";
import { sampleAdapter } from "./sample";

export const liveAdapters: ListingAdapter[] = [
  ebayAdapter,
  etsyAdapter,
  chrono24Adapter,
];

export { sampleAdapter };
