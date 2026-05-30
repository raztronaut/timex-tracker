import type { ListingAdapter, RawListing } from "../types";
import { scrape } from "../olostep";

const ETSY_SEARCH_URL = "https://www.etsy.com/ca/search";

function parseMarkdownListings(md: string): RawListing[] {
  const listings: RawListing[] = [];
  const lines = md.split("\n");
  let current: Partial<RawListing> | null = null;

  for (const line of lines) {
    // Match title links: [Title](https://www.etsy.com/...listing/12345...)
    const titleMatch = line.match(
      /\[([^\]]{10,})\]\((https?:\/\/www\.etsy\.com\/[^\s)]*listing\/\d+[^\s)]*)\)/
    );
    if (titleMatch) {
      if (current?.title && current?.url) {
        finalizeListing(current, listings);
      }
      const url = titleMatch[2].split("?")[0];
      const listingId = extractListingId(url);
      current = {
        source: "etsy",
        sourceId: listingId,
        url,
        title: titleMatch[1].trim(),
        currency: "CAD",
        conditionRaw: "Pre-Owned",
        images: [],
        location: null,
        listedAt: null,
        price: 0,
        shippingCost: null,
      };
      continue;
    }

    if (!current) continue;

    // Match prices: CA$12.34 or C$12.34 or $12.34
    const priceMatch = line.match(/(?:CA?\$|CAD\s*)\s*([\d,]+\.?\d*)/);
    if (priceMatch && current.price === 0) {
      current.price = parseFloat(priceMatch[1].replace(/,/g, ""));
    }
    if (current.price === 0) {
      const simplePrice = line.match(/\$\s*([\d,]+\.?\d*)/);
      if (simplePrice) {
        current.price = parseFloat(simplePrice[1].replace(/,/g, ""));
      }
    }

    // Free shipping
    if (/free\s+(delivery|shipping)/i.test(line)) {
      current.shippingCost = 0;
    }

    // Match Etsy image URLs
    const imgMatch = line.match(/(https?:\/\/i\.etsystatic\.com\/[^\s)]+)/);
    if (imgMatch && current.images) {
      current.images.push(imgMatch[1]);
    }
  }

  if (current?.title && current?.url) {
    finalizeListing(current, listings);
  }

  return listings;
}

function finalizeListing(partial: Partial<RawListing>, out: RawListing[]) {
  if (!partial.title || !partial.url || !partial.price || partial.price <= 0) return;
  out.push({
    source: "etsy",
    sourceId: partial.sourceId || partial.url,
    url: partial.url,
    title: partial.title,
    price: partial.price,
    currency: partial.currency || "CAD",
    shippingCost: partial.shippingCost ?? null,
    conditionRaw: partial.conditionRaw || "Pre-Owned",
    images: partial.images || [],
    location: partial.location || null,
    listedAt: null,
  });
}

function extractListingId(url: string): string {
  const match = url.match(/listing\/(\d+)/);
  return match ? match[1] : url;
}

export const etsyAdapter: ListingAdapter = {
  source: "etsy",

  async fetchListings(query: string): Promise<RawListing[]> {
    const params = new URLSearchParams({
      q: query,
      max: "50",
      currency_code: "CAD",
    });

    const searchUrl = `${ETSY_SEARCH_URL}?${params}`;

    try {
      const result = await scrape({
        url: searchUrl,
        formats: ["markdown"],
        waitBeforeScraping: 2000,
        country: "CA",
      });

      const md = result.markdown_content || "";
      if (!md) {
        console.warn("Etsy: empty markdown from Olostep");
        return [];
      }

      const listings = parseMarkdownListings(md);
      console.log(`Etsy: parsed ${listings.length} listings from ${md.length} chars of markdown`);
      return listings;
    } catch (err) {
      console.error("Etsy scrape failed:", err);
      return [];
    }
  },
};
