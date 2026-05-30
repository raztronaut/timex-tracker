# Adapters

Adapters fetch raw listings from marketplaces. Each adapter implements the `ListingAdapter` interface defined in `src/lib/types.ts`:

```typescript
interface ListingAdapter {
  source: ListingSource;  // "ebay" | "etsy" | "chrono24" | "sample"
  fetchListings(query: string): Promise<AdapterResult>;
}

interface AdapterResult {
  listings: RawListing[];
  error?: string;
}
```

An adapter can return both listings and an error (partial success). Returning `{ listings: [], error: "..." }` signals a failure. Returning `{ listings: [] }` (no error) signals genuinely empty results.

## Adapter registry

`src/lib/adapters/index.ts` exports two things:

- **`liveAdapters`** — Array of adapters that hit real marketplaces: eBay, Etsy, Chrono24. These run concurrently during sync via `Promise.allSettled`.
- **`sampleAdapter`** — Demo fallback. Invoked separately in `runFullSync()` only when all live adapters return zero listings and none errored.

## eBay adapter

**File:** `src/lib/adapters/ebay.ts`

Constructs an eBay Canada search URL with params for the query, $50 price cap, pre-owned condition, and sorted by newly listed. Sends it to Olostep for scraping as markdown, then parses the result.

**Parser:** `parseMarkdownListings()` walks the markdown line-by-line looking for:
- Title links matching `[Title](https://www.ebay.ca/itm/...)`
- Prices in `C $X.XX` or `$X.XX` format
- Shipping: "Free shipping" or `+C $X.XX shipping`
- Condition strings: Pre-Owned, New, For parts, etc.
- Image URLs from `i.ebayimg.com`
- Location from "from [location]" patterns

Each listing is deduplicated by `sourceId` (format: `v1|{itemId}|0`). Listings without a title, URL, or valid price are dropped.

## Etsy adapter

**File:** `src/lib/adapters/etsy.ts`

Constructs an Etsy Canada search URL with the query, $50 max price, and CAD currency. Same scrape-then-parse pattern as eBay.

**Parser differences from eBay:**
- Title links match `https://www.etsy.com/...listing/{id}...`
- Prices match `CA$X.XX` or `C$X.XX` or `$X.XX`
- Default condition is "Pre-Owned" (Etsy doesn't always surface condition)
- Images come from `i.etsystatic.com`
- `sourceId` is the Etsy listing ID extracted from the URL

## Chrono24 adapter

**File:** `src/lib/adapters/chrono24.ts`

Stub — returns `{ listings: [] }` with no error. Chrono24 has no public API and aggressively blocks automated requests. The adapter exists so the interface is ready when a scraping path becomes viable.

## Sample adapter

**File:** `src/lib/adapters/sample.ts`

Returns a hardcoded set of listings derived from the taste profile reference buys plus additional edge cases (broken item, over-budget item, needs-battery item, collaborations). All listings have `source: "sample"` and `sourceId` prefixed with `sample-`.

Used as a demo fallback only — never mixed with live data during a sync where adapters found results or errored.

## Image extraction

**File:** `src/lib/adapters/parse-images.ts`

Marketplace adapters extract image URLs during markdown parsing, but Olostep sometimes returns HTML fragments alongside markdown. `parse-images.ts` provides two helpers:

- **`extractMarketplaceImageUrls(text, source)`** — Pulls image URLs from a line of markdown or HTML using source-specific regex patterns (eBay: `i.ebayimg.com`, `ir.ebaystatic.com`; Etsy: `i.etsystatic.com`).
- **`enrichListingsWithHtmlImages(listings, html, source)`** — Scans raw HTML for additional image URLs and merges them into listings that have no images from markdown parsing.

## Adding a new marketplace

1. **Create the adapter file** at `src/lib/adapters/{marketplace}.ts`.
2. **Implement `ListingAdapter`** — set `source` to a new `ListingSource` value.
3. **Add the source to the union type** in `src/lib/types.ts`: `export type ListingSource = "ebay" | "etsy" | ... | "newmarket"`.
4. **Register in `src/lib/adapters/index.ts`** — add to `liveAdapters`.
5. **Add image URL patterns** to `parse-images.ts` if the marketplace uses a different image CDN.
6. **Write parser tests** in `src/lib/__tests__/{marketplace}-parse.test.ts` using markdown fixtures. Test title, price, shipping, image, and deduplication extraction.
7. **Run verification:** `npm test && npx tsc --noEmit && npm run build`.

## Parser maintenance

Marketplace HTML/markdown layouts change without warning. When an adapter starts returning zero listings despite known inventory:

1. Scrape a fresh markdown sample via Olostep (or save one from logs).
2. Compare against the parser's regex patterns.
3. Update the patterns and add the new markdown as a test fixture.
4. Ensure existing fixtures still parse correctly (regression check).
