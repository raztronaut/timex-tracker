import type { RawListing } from "../types";

const EBAY_IMAGE_URL =
  /https?:\/\/(?:i\.ebayimg\.com|ir\.ebaystatic\.com|thumbs\.ebaystatic\.com)[^\s)"'<>]+/gi;

const ETSY_IMAGE_URL = /https?:\/\/i\.etsystatic\.com[^\s)"'<>]+/gi;

function cleanImageUrl(url: string): string {
  return url.replace(/[)\]"',;]+$/, "");
}

/** Pull marketplace image URLs from a line of markdown or HTML. */
export function extractMarketplaceImageUrls(
  text: string,
  source: "ebay" | "etsy"
): string[] {
  const pattern = source === "ebay" ? EBAY_IMAGE_URL : ETSY_IMAGE_URL;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches.map(cleanImageUrl))];
}

function itemIdFromListing(listing: RawListing, source: "ebay" | "etsy"): string | null {
  if (source === "ebay") {
    return listing.url.match(/\/itm\/(\d+)/)?.[1] ?? null;
  }
  return listing.url.match(/listing\/(\d+)/)?.[1] ?? null;
}

/** When markdown omits images, recover them from the HTML scrape near each listing URL. */
export function enrichListingsWithHtmlImages(
  listings: RawListing[],
  html: string | undefined,
  source: "ebay" | "etsy"
): RawListing[] {
  if (!html?.trim()) return listings;

  return listings.map((listing) => {
    if (listing.images.length > 0) return listing;

    const itemId = itemIdFromListing(listing, source);
    if (!itemId) return listing;

    const needle = source === "ebay" ? `/itm/${itemId}` : `/listing/${itemId}`;
    const idx = html.indexOf(needle);
    if (idx === -1) return listing;

    const window = html.slice(Math.max(0, idx - 500), idx + 8000);
    const images = extractMarketplaceImageUrls(window, source);
    if (images.length === 0) return listing;

    return { ...listing, images };
  });
}
