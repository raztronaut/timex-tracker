# Domain Context — Timex Tracker

Domain vocabulary for the codebase. Use these terms consistently in code, comments, and conversations.

## Core Concepts

**Listing** — A marketplace item (watch) from any source. The domain object. Has two lifecycle stages: raw (from adapter) and normalized (with CAD totals, broken detection). Persisted to Supabase with an `id`, timestamps, and scoring data.

**Candidate** — A Listing that passes all rules AND scores at or above `CANDIDATE_THRESHOLD` (55). The subset worth paying attention to. Stored as `is_candidate: true` in the database.

**Taste Profile** — The collector's preferences, anchored on reference buys. Single source of truth in `src/lib/taste-profile.ts`. Drives scoring (both keyword and LLM), sample data seeding, and the UI reference collection display.

**Sync** — The pipeline that pulls listings from adapters, normalizes, filters, scores, and persists them. Triggered by cron or manually. Each adapter sync creates a `SyncRun` record.

**Rules** — Binary gates that exclude listings. Currently: total cost ≤ $50 CAD (`MAX_TOTAL_COST_CAD`) and not broken. Distinct from scoring — rules are auditable facts, not taste.

**Scoring** — Subjective ranking of how interesting a listing is to this collector. Two modes: keyword (deterministic, zero-cost) and LLM (opt-in via `ENABLE_AI_SCORING`). Both consume the Taste Profile.

**Adapter** — A module satisfying the `ListingAdapter` interface that fetches raw listings from a marketplace. Currently: eBay, Etsy (live via Olostep), Chrono24 (stub), Sample (seed data).

## Pipeline Types

**RawListing** — What an adapter returns. Source-specific fields only: `source`, `sourceId`, `url`, `title`, `price`, `currency`, `shippingCost`, `conditionRaw`, `images`, `location`, `listedAt`.

**NormalizedListing** — After `normalize()`. Adds computed fields: `totalCostCad` (price + shipping converted to CAD), `isBroken` (from condition detection), `shippingUnknown` (true when shipping was null on the source page).

**InterestResult** — Output of the scorer: `score` (0–100), `tags` (string array), `rationale` (one-line explanation).

**AdapterResult** — What `fetchListings()` returns: `listings` (array of `RawListing`) plus an optional `error` string. An adapter can return both listings *and* an error (partial success).

**SyncResult** — Per-adapter outcome of a sync run: counts for `found`, `passed`, `excluded`, `errors`, plus timing and optional `adapterError`.

**SyncRun** — Database record tracking a single adapter's sync execution: timestamps, source, counts.

## Adapter Concepts

**liveAdapters** — The array of adapters that hit real marketplaces: eBay, Etsy, Chrono24. Registered in `src/lib/adapters/index.ts`.

**sampleAdapter** — Demo fallback adapter. Only invoked when all live adapters return zero listings and none errored. Listings have `source: "sample"` and `sourceId` prefixed with `sample-`.

**adapterError** — When an adapter fails (Olostep down, empty markdown, network error), it returns `{ listings: [], error: "..." }` instead of throwing. This lets `runFullSync` distinguish "nothing found" from "something broke."

**parse-images** — `src/lib/adapters/parse-images.ts`. Extracts marketplace image URLs from markdown/HTML via `extractMarketplaceImageUrls()` and enriches listings with additional images via `enrichListingsWithHtmlImages()`.

## Persistence

**toScoredRow** — Maps a `NormalizedListing` + `InterestResult` to a database insert row. Sets `is_candidate` based on `CANDIDATE_THRESHOLD`.

**toExcludedRow** — Maps a rule-failing `NormalizedListing` to a database insert row with `is_candidate: false` and a rationale explaining the exclusion.

**fromRow** — Converts a snake_case database row to a camelCase `Listing` domain object.

**Upsert key** — `(source, source_id)`. The same listing from the same marketplace is updated in place, not duplicated.

## UI Concepts

**FilterBar** — Filter (candidates / excluded / all), sort, and source controls.

**ListingGrid** — Responsive grid of `ListingCard` components.

**ListingCard** — Single listing: image, title, price, score badge, tags, source badge.

**ListingDrawer** — Slide-out detail panel with full metadata, all images, and rationale.

**ReferenceCollection** — Displays the three taste profile reference buys.

**SyncStatus** — Last sync time, totals, candidate count, and the sync button.

## Naming Conventions

- Domain objects use camelCase: `totalCostCad`, `isBroken`, `interestScore`
- Database columns use snake_case: `total_cost_cad`, `is_broken`, `interest_score`
- The persistence module (`src/lib/listings.ts`) bridges these; no other module should know about snake_case
- Sources are a union type: `"ebay" | "etsy" | "chrono24" | "sample"`
- Postal code `M6K1V8` is the fixed shipping destination (hardcoded in context, not in code)
