import type { ListingAdapter, RawListing, AdapterResult } from "../types";
import { scrape } from "../olostep";
import {
  enrichListingsWithHtmlImages,
  extractMarketplaceImageUrls,
} from "./parse-images";

const ETSY_SEARCH_URL = "https://www.etsy.com/ca/search";

export function parseMarkdownListings(md: string): RawListing[] {
  const listings: RawListing[] = [];
  const lines = md.split("\n");
  let current: Partial<RawListing> | null = null;

  for (const line of lines) {
    // Pattern 1: Image-wrapped link (live Olostep format)
    // [![Title](img-url)](https://www.etsy.com/.../listing/12345...)
    const imgTitleMatch = line.match(
      /\[!\[([^\]]*)\]\(([^\)]+)\)\]\((https?:\/\/www\.etsy\.com\/[^\s)]*listing\/\d+[^\s)]*)\)/,
    );
    if (imgTitleMatch && imgTitleMatch[1].length >= 5) {
      if (current?.title && current?.url) {
        finalizeListing(current, listings);
      }
      const rawUrl = imgTitleMatch[3].split("?")[0];
      const listingId = extractListingId(rawUrl);
      current = {
        source: "etsy",
        sourceId: listingId,
        url: rawUrl,
        title: imgTitleMatch[1].trim(),
        currency: "CAD",
        conditionRaw: "Pre-Owned",
        images: [imgTitleMatch[2]],
        location: null,
        listedAt: null,
        price: 0,
        shippingCost: null,
      };
      continue;
    }

    // Pattern 2: Plain text link (test fixtures / simpler markdown)
    const titleMatch = line.match(
      /\[([^\]]{10,})\]\((https?:\/\/www\.etsy\.com\/[^\s)]*listing\/\d+[^\s)]*)\)/,
    );
    if (titleMatch) {
      if (current?.title && current?.url) {
        finalizeListing(current, listings);
      }
      const rawUrl = titleMatch[2].split("?")[0];
      const listingId = extractListingId(rawUrl);
      current = {
        source: "etsy",
        sourceId: listingId,
        url: rawUrl,
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

    if (current.images) {
      for (const imgUrl of extractMarketplaceImageUrls(line, "etsy")) {
        current.images.push(imgUrl);
      }
    }
  }

  if (current?.title && current?.url) {
    finalizeListing(current, listings);
  }

  return dedupeListings(listings);
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
    images: [...new Set(partial.images || [])],
    location: partial.location || null,
    listedAt: null,
  });
}

function dedupeListings(listings: RawListing[]): RawListing[] {
  const seen = new Set<string>();
  return listings.filter((l) => {
    if (seen.has(l.sourceId)) return false;
    seen.add(l.sourceId);
    return true;
  });
}

function extractListingId(url: string): string {
  const match = url.match(/listing\/(\d+)/);
  return match ? match[1] : url;
}

export const etsyAdapter: ListingAdapter = {
  source: "etsy",

  async fetchListings(query: string): Promise<AdapterResult> {
    const params = new URLSearchParams({
      q: query,
      max: "50",
      currency_code: "CAD",
    });

    const searchUrl = `${ETSY_SEARCH_URL}?${params}`;

    try {
      const result = await scrape({
        url: searchUrl,
        formats: ["markdown", "html"],
        waitBeforeScraping: 5000,
        country: "CA",
        screenSize: { screenType: "desktop" },
      });

      const md = result.markdown_content || "";
      if (!md) {
        console.warn("Etsy: empty markdown from Olostep");
        return { listings: [], error: "Empty markdown response from Olostep" };
      }

      const listings = enrichListingsWithHtmlImages(
        parseMarkdownListings(md),
        result.html_content,
        "etsy",
      );
      const withImages = listings.filter((l) => l.images.length > 0).length;
      console.log(
        `Etsy: parsed ${listings.length} listings (${withImages} with images) from ${md.length} chars markdown`,
      );

      if (listings.length === 0 && md.length > 500) {
        return {
          listings: [],
          error: `Parser found 0 listings in ${md.length} chars of markdown — format may have changed`,
        };
      }

      return { listings };
    } catch (err) {
      console.error("Etsy scrape failed:", err);
      return { listings: [], error: String(err) };
    }
  },
};
