import type { ListingAdapter, RawListing, AdapterResult } from "../types";
import { scrape } from "../olostep";
import {
  enrichListingsWithHtmlImages,
  extractMarketplaceImageUrls,
} from "./parse-images";

const EBAY_SEARCH_URL = "https://www.ebay.ca/sch/i.html";

export function parseMarkdownListings(md: string): RawListing[] {
  const listings: RawListing[] = [];
  const lines = md.split("\n");
  let current: Partial<RawListing> | null = null;

  for (const line of lines) {
    // Pattern 1: Image-wrapped link on a single line (live Olostep format)
    // [![Title](img-url)](https://www.ebay.ca/itm/...)
    const imgTitleMatch = line.match(
      /\[!\[([^\]]+)\]\(([^\)]+)\)\]\((https?:\/\/www\.ebay\.(?:ca|com)\/itm\/[^\s)]+)\)/,
    );
    if (imgTitleMatch) {
      if (current?.title && current?.url) {
        finalizeListing(current, listings);
      }
      const rawUrl = imgTitleMatch[3].split("?")[0];
      const itemId = extractItemId(rawUrl);
      current = {
        source: "ebay",
        sourceId: `v1|${itemId}|0`,
        url: rawUrl,
        title: imgTitleMatch[1].trim(),
        currency: "CAD",
        conditionRaw: "",
        images: [imgTitleMatch[2]],
        location: null,
        listedAt: null,
        price: 0,
        shippingCost: null,
      };
      continue;
    }

    // Pattern 2: Plain text link (test fixtures / simpler markdown)
    // [Title Text](https://www.ebay.ca/itm/...)
    const titleMatch = line.match(
      /\[([^\]]{10,})\]\((https?:\/\/www\.ebay\.(?:ca|com)\/itm\/[^\s)]+)\)/,
    );
    if (titleMatch) {
      if (current?.title && current?.url) {
        finalizeListing(current, listings);
      }
      const rawUrl = titleMatch[2].split("?")[0];
      const itemId = extractItemId(rawUrl);
      current = {
        source: "ebay",
        sourceId: `v1|${itemId}|0`,
        url: rawUrl,
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

    // Match condition — only on lines where it's the primary content,
    // not embedded in "Opens in a new window or tab" or title text.
    const trimmed = line.trim();
    const condMatch = trimmed.match(
      /^(Pre-Owned|Brand New|For parts or not working|For parts|Refurbished|Open box|Used|New)$/i,
    );
    if (condMatch && !current.conditionRaw) {
      current.conditionRaw = condMatch[1];
    }

    if (current.images) {
      for (const imgUrl of extractMarketplaceImageUrls(line, "ebay")) {
        current.images.push(imgUrl);
      }
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

  return dedupeListings(listings);
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

function extractItemId(url: string): string {
  const match = url.match(/\/itm\/(\d+)/);
  if (match) return match[1];
  const match2 = url.match(/itm\/[^/]*\/(\d+)/);
  if (match2) return match2[1];
  return url.replace(/\D/g, "").slice(-12);
}

export const ebayAdapter: ListingAdapter = {
  source: "ebay",

  async fetchListings(query: string): Promise<AdapterResult> {
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
        formats: ["markdown", "html"],
        waitBeforeScraping: 5000,
        country: "CA",
        screenSize: { screenType: "desktop" },
      });

      const md = result.markdown_content || "";
      if (!md) {
        console.warn("eBay: empty markdown from Olostep");
        return { listings: [], error: "Empty markdown response from Olostep" };
      }

      const listings = enrichListingsWithHtmlImages(
        parseMarkdownListings(md),
        result.html_content,
        "ebay",
      );
      const withImages = listings.filter((l) => l.images.length > 0).length;
      console.log(
        `eBay: parsed ${listings.length} listings (${withImages} with images) from ${md.length} chars markdown`,
      );

      if (listings.length === 0 && md.length > 500) {
        return {
          listings: [],
          error: `Parser found 0 listings in ${md.length} chars of markdown — format may have changed`,
        };
      }

      return { listings };
    } catch (err) {
      console.error("eBay scrape failed:", err);
      return { listings: [], error: String(err) };
    }
  },
};
