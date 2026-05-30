# Architecture

Timex Tracker is a single-user vintage watch listing aggregator. It syncs listings from marketplaces, applies hard rules to exclude unsuitable items, scores the remainder for interestingness, and persists everything to Supabase. A Next.js frontend renders the results.

## Pipeline

Every sync — whether triggered by Vercel cron or the dashboard button — runs the same pipeline:

```
Adapters (eBay, Etsy, Chrono24, Sample)
    │
    ▼
Normalize (convert currency, compute totalCostCad, detect broken)
    │
    ▼
Rules (binary gates: ≤$50 CAD total, not broken)
    │
    ├── Passing ──▶ Score (keyword or LLM) ──▶ Upsert as scored row
    │
    └── Failing ──▶ Upsert as excluded row (no score, rationale explains why)
```

Adapters run **sequentially** to avoid Vercel function timeout pressure (each Olostep scrape can take up to 55 seconds). If every live adapter returns zero listings *and* none reported an error, the sample adapter runs as a demo fallback. If any adapter errored, the failure is surfaced — sample data never masks real failures. When live adapters find at least one listing, any stale `source = "sample"` rows are purged from the database.

## Module responsibilities

| Module | Owns | Must not know about |
|--------|------|---------------------|
| `src/lib/types.ts` | All domain interfaces: `RawListing`, `NormalizedListing`, `Listing`, `AdapterResult`, `ListingAdapter`, `InterestResult`, `SyncRun` | Database column names, UI concerns |
| `src/lib/adapters/*.ts` | Fetching raw listings from a single marketplace | Normalization, scoring, persistence |
| `src/lib/adapters/parse-images.ts` | Image URL extraction from markdown/HTML; listing image enrichment | Adapter-specific parsing logic |
| `src/lib/olostep.ts` | HTTP calls to the Olostep scrape API; hosted URL fallback; page status validation | Which marketplace is being scraped |
| `src/lib/normalize.ts` | Currency conversion to CAD, broken detection, rule constants (`MAX_TOTAL_COST_CAD`, `CANDIDATE_THRESHOLD`) | Scoring, persistence |
| `src/lib/condition.ts` | Broken-item regex patterns; "needs battery" exemption | Price, source, anything beyond title + condition text |
| `src/lib/currency.ts` | Static FX rates; `toCad()` conversion | Everything outside (amount, currency) → CAD |
| `src/lib/scorer.ts` | Keyword rules, LLM scoring path, fallback logic | Persistence, API layer |
| `src/lib/taste-profile.ts` | Reference buys, taste summary for LLM prompt, display metadata | Scoring logic (consumed by scorer, not the reverse) |
| `src/lib/listings.ts` | camelCase ↔ snake_case row mapping, upsert, query building | Raw listings, adapters, scoring rules |
| `src/lib/sync.ts` | Pipeline orchestration: adapters → normalize → rules → score → persist | UI, API auth, HTTP response formatting |
| `src/lib/sync-status.ts` | `sync_runs` query, aggregate counts | Sync execution |
| `src/app/api/sync/route.ts` | Auth (`CRON_SECRET`), 5-min cooldown, HTTP response | Pipeline internals |
| `src/app/api/listings/route.ts` | Query param parsing, pagination limits | Scoring, sync |
| `src/app/api/sync-status/route.ts` | Sync history endpoint | Everything — thin pass-through |
| `src/hooks/useListings.ts` | Client-side listing fetch, filter/sort/source state | Server-side persistence |
| `src/hooks/useSync.ts` | Client-side sync trigger, status polling, `NEXT_PUBLIC_SYNC_SECRET` | Pipeline internals |
| `src/lib/image-loader.ts` | Next.js image loader config for marketplace CDNs | Everything outside image URL → loader |
| `src/features/listings/` | Listing UI: grid, cards, drawer, filter bar | Data fetching (delegated to hooks) |
| `src/components/` | Dashboard orchestration, sync status display, taste profile, shared UI primitives | Persistence, API internals |

## Data flow

```
RawListing (from adapter)
  │  Fields: source, sourceId, url, title, price, currency,
  │          shippingCost, conditionRaw, images, location, listedAt
  │
  ▼  normalize()
NormalizedListing
  │  Adds: totalCostCad, isBroken, shippingUnknown
  │
  ├── passesRules() = true ───▶ scoreListingsBatch() ───▶ toScoredRow()
  │                                                          │
  └── passesRules() = false ──────────────────────────▶ toExcludedRow()
                                                             │
                                                             ▼
                                                     upsertListing() ──▶ Supabase
                                                     (onConflict: source + source_id)
```

The persistence layer (`listings.ts`) is the only module that knows about snake_case database columns. Every other module works with camelCase domain objects.

## Failure modes

| Scenario | Behavior |
|----------|----------|
| Adapter throws | Caught by sequential try/catch; `SyncResult` records `adapterError` |
| Adapter returns `{ listings: [], error: "..." }` | Error surfaced in result; zero listings counted; sample fallback suppressed |
| All live adapters return zero listings, no errors | Sample adapter runs as demo fallback |
| All live adapters return zero listings, at least one errored | No fallback — errors are reported to the UI |
| Olostep returns empty markdown | Adapter returns `{ listings: [], error: "Empty markdown..." }` |
| Olostep returns markdown but parser finds 0 listings | Adapter returns `{ listings: [], error: "Parser found 0 listings..." }` — prevents silent demo fallback |
| Olostep inline content empty but hosted URL exists | Client fetches hosted URL as fallback before returning |
| Olostep target page returns 4xx/5xx | `scrape()` throws with status code and page title |
| `OLOSTEP_API_KEY` missing | `scrape()` throws; adapter catches and returns error |
| LLM scorer fails | Falls back to keyword scorer; warning logged |
| Upsert fails for a single listing | Error counted; other listings still processed |

## External dependencies

| Service | Purpose | Required |
|---------|---------|----------|
| Supabase | Listing + sync_run persistence | Yes |
| Olostep | Scrapes eBay/Etsy search results as markdown | Yes (for live data) |
| OpenAI (GPT-4o-mini) | LLM interest scoring | No — opt-in via `ENABLE_AI_SCORING=true` |
| Vercel | Hosting, cron (`0 14 * * *` daily) | For production |

## Extension points

**New marketplace adapter.** Implement `ListingAdapter` (a `source` string and `fetchListings(query): Promise<AdapterResult>`), add it to `liveAdapters` in `src/lib/adapters/index.ts`. Write parser tests with markdown fixtures. See [docs/adapters.md](adapters.md).

**New scoring mode.** Add a branch in `scorer.ts` gated on an env var, following the `scoreWithKeywords` / `scoreWithAI` pattern. Must return `InterestResult`.

**New filter rule.** Add to `passesRules()` in `normalize.ts`. Keep rules binary — taste belongs in the scorer.
