import type { ListingAdapter, RawListing } from "../types";
import { scrape } from "../olostep";

const EBAY_SEARCH_URL = "https://www.ebay.ca/sch/i.html";

function parseMarkdownListings(md: string): RawListing[] {
  const listings: RawListing[] = [];

  // eBay search results in markdown typically render as repeated blocks
  // with title links, price, shipping, condition, and image URLs.
  const lines = md.split("\n");
  let current: Partial<RawListing> | null = null;

  for (const line of lines) {
    // Match title links: [Title Text](https://www.ebay.ca/itm/...)
    const titleMatch = line.match(
      /\[([^\]]{10,})\]\((https?:\/\/www\.ebay\.ca\/itm\/[^\s)]+)\)/
    );
    if (titleMatch) {
      if (current?.title && current?.url) {
        finalizeListing(current, listings);
      }
      const url = titleMatch[2].split("?")[0];
      const itemId = extractItemId(url);
      current = {
        source: "ebay",
        sourceId: `v1|${itemId}|0`,
        url,
        title: titleMatch[1].trim(),
        currency: "CAD",
        conditionRaw: "",
        images: [],
        location: null,
        listedAt: null,
        price: 0,
        shippingCost: null,
      };
      continue;
    }

    if (!current) continue;

    // Match prices: C $12.34 or $12.34 or CAD 12.34
    const priceMatch = line.match(/(?:C\s*)?(?:CAD\s*)?\$\s*([\d,]+\.?\d*)/);
    if (priceMatch && current.price === 0) {
      current.price = parseFloat(priceMatch[1].replace(/,/g, ""));
    }

    // Match shipping: +C $5.00 shipping or Free shipping
    if (/free\s+shipping/i.test(line)) {
      current.shippingCost = 0;
    } else {
      const shipMatch = line.match(/\+\s*(?:C\s*)?\$\s*([\d,]+\.?\d*)\s*ship/i);
      if (shipMatch) {
        current.shippingCost = parseFloat(shipMatch[1].replace(/,/g, ""));
      }
    }

    // Match condition
    const condMatch = line.match(
      /\b(Pre-Owned|New|Used|Brand New|For parts|Refurbished|Open box)\b/i
    );
    if (condMatch && !current.conditionRaw) {
      current.conditionRaw = condMatch[1];
    }

    // Match image URLs
    const imgMatch = line.match(/(https?:\/\/i\.ebayimg\.com\/[^\s)]+)/);
    if (imgMatch && current.images) {
      current.images.push(imgMatch[1]);
    }

    // Match location
    const locMatch = line.match(/from\s+([\w\s,]+(?:Canada|United States|UK))/i);
    if (locMatch) {
      current.location = locMatch[1].trim();
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
    source: "ebay",
    sourceId: partial.sourceId || partial.url,
    url: partial.url,
    title: partial.title,
    price: partial.price,
    currency: partial.currency || "CAD",
    shippingCost: partial.shippingCost ?? null,
    conditionRaw: partial.conditionRaw || "",
    images: partial.images || [],
    location: partial.location || null,
    listedAt: null,
  });
}

function extractItemId(url: string): string {
  const match = url.match(/\/itm\/(\d+)/);
  if (match) return match[1];
  const match2 = url.match(/itm\/[^/]*\/(\d+)/);
  if (match2) return match2[1];
  return url.replace(/\D/g, "").slice(-12);
}

export const ebayAdapter: ListingAdapter = {
  source: "ebay",

  async fetchListings(query: string): Promise<RawListing[]> {
    const params = new URLSearchParams({
      _nkw: query,
      _udhi: "50",
      LH_PrefLoc: "2",
      _sop: "15",
      LH_ItemCondition: "4",
    });

    const searchUrl = `${EBAY_SEARCH_URL}?${params}`;

    try {
      const result = await scrape({
        url: searchUrl,
        formats: ["markdown"],
        waitBeforeScraping: 2000,
        country: "CA",
      });

      const md = result.markdown_content || "";
      if (!md) {
        console.warn("eBay: empty markdown from Olostep");
        return [];
      }

      const listings = parseMarkdownListings(md);
      console.log(`eBay: parsed ${listings.length} listings from ${md.length} chars of markdown`);
      return listings;
    } catch (err) {
      console.error("eBay scrape failed:", err);
      return [];
    }
  },
};
