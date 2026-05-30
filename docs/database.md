# Database

Supabase (Postgres) with two tables. The schema is defined in `supabase/migration.sql` — run it manually in the Supabase SQL editor (there is no automated migration runner in this repo).

## Tables

### `listings`

Stores every listing the sync pipeline has seen, whether candidate or excluded.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid (PK) | Auto-generated |
| `source` | text | Marketplace: `ebay`, `etsy`, `chrono24`, `sample` |
| `source_id` | text | Marketplace-specific listing identifier |
| `url` | text | Link to the original listing |
| `title` | text | Listing title as scraped |
| `price` | numeric | Listed price in original currency |
| `currency` | text | Original currency code (default: `CAD`) |
| `shipping_cost` | numeric (nullable) | Shipping cost if known; null if unknown |
| `total_cost_cad` | numeric | Price + shipping converted to CAD |
| `condition_raw` | text | Condition text from the marketplace |
| `is_broken` | boolean | True if condition detection flagged as broken |
| `images` | jsonb | Array of image URLs |
| `location` | text (nullable) | Seller location if available |
| `listed_at` | timestamptz (nullable) | When the listing was posted (if available) |
| `interest_score` | integer (nullable) | 0–100 interestingness score; null if excluded by rules |
| `interest_tags` | jsonb | Array of tag strings from scoring |
| `interest_rationale` | text (nullable) | One-line explanation of the score or exclusion reason |
| `is_candidate` | boolean | True if score ≥ `CANDIDATE_THRESHOLD` (55) |
| `first_seen_at` | timestamptz | When this listing was first synced |
| `last_seen_at` | timestamptz | Updated on every sync that sees this listing |

**Unique constraint:** `(source, source_id)` — prevents duplicate listings from the same marketplace.

**Indexes:**
- `idx_listings_candidate` — partial index on `is_candidate = true` for fast candidate queries
- `idx_listings_score` — descending on `interest_score` for sorted display
- `idx_listings_source` — for source-filtered queries

### `sync_runs`

Tracks each adapter's sync execution.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid (PK) | Auto-generated |
| `started_at` | timestamptz | When the sync started |
| `finished_at` | timestamptz (nullable) | When the sync completed |
| `source` | text | Which adapter ran |
| `found` | integer | Raw listings fetched |
| `inserted` | integer | Listings that passed rules (pipeline count, not a Postgres INSERT count) |
| `updated` | integer | Listings excluded by rules (pipeline count, not a Postgres UPDATE count) |
| `errors` | integer | Upsert or adapter errors |

## Upsert behavior

All listing writes use Supabase's `upsert` with `onConflict: "source,source_id"`. A listing seen in a subsequent sync updates in place — `last_seen_at` is refreshed, and score/candidate status may change if the scoring rules have been modified.

## Row mapping

`src/lib/listings.ts` is the only module that knows about snake_case column names. It provides:

- **`fromRow()`** — Converts a snake_case DB row to a camelCase `Listing` domain object.
- **`toScoredRow()`** — Converts a `NormalizedListing` + `InterestResult` to an insert row. Sets `is_candidate` based on `CANDIDATE_THRESHOLD`.
- **`toExcludedRow()`** — Converts a rule-failing listing to an insert row with `is_candidate: false` and a rationale explaining why.
- **`upsertListing()`** — Performs the Supabase upsert.
- **`queryListings()`** — Builds filtered, sorted, paginated queries for the API.

## Migration notes

The repo has no automated migration tooling. Schema changes should be:

1. Written as SQL in a new file under `supabase/` (or appended to `migration.sql`).
2. Run manually in the Supabase Dashboard SQL editor.
3. Reflected in `src/lib/listings.ts` (row types and mapping functions).
4. Documented in this file.
