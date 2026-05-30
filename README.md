# Timex Tracker

**[Live Demo →](https://timex-tracker.vercel.app)**

A tool for a vintage Timex collector to stay on top of interesting listings across eBay, Etsy, and other marketplaces — without manually checking each site.

## Documentation

| Document | Audience | Contents |
|----------|----------|----------|
| [docs/architecture.md](docs/architecture.md) | Devs, agents | Pipeline, module responsibilities, data flow, failure modes |
| [docs/development.md](docs/development.md) | Devs | Local setup, safe development, testing, debugging, deploy |
| [docs/adapters.md](docs/adapters.md) | Devs, agents | Adapter contract, per-marketplace notes, how to add a marketplace |
| [docs/scoring.md](docs/scoring.md) | Devs, agents | Taste profile, keyword rules, LLM path, thresholds |
| [docs/database.md](docs/database.md) | Devs, agents | Schema, upsert behavior, row mapping, migration notes |
| [docs/api.md](docs/api.md) | Devs, agents | Route reference, auth, params, response shapes |
| [docs/adr/](docs/adr/) | Devs, agents | Architectural decisions and their rationale |
| [CONTEXT.md](CONTEXT.md) | Agents | Domain vocabulary |
| [AGENTS.md](AGENTS.md) | Agents | Read order, constraints, commands, edit map |

## What It Does

Timex Tracker syncs listings, filters out the noise, and surfaces the few worth paying attention to. It answers one question: **"Is anything good out there right now?"**

**Hard rules** knock out listings that don't fit:
- Total cost (price + shipping to M6K1V8) must be under $50 CAD
- Can't be explicitly broken ("for parts", "not working") — but needing a battery is fine

**Interest scoring** ranks what's left by how much it matches the collector's taste. The scorer is anchored on three actual recent purchases:

| Purchase | Why it matters |
|----------|---------------|
| [Timex Marlin Mechanical (1970s)](https://www.ebay.ca/itm/377073705816) | Vintage hand-wind dress watches |
| [Timex Breyers Ice Cream Watch](https://www.ebay.ca/itm/377073705817) | Vintage promotional / brand collaboration pieces |
| [Timex DeKalb Corn Watch (NOS)](https://www.ebay.ca/itm/377073705818) | Rare promotional items, deadstock/NOS condition |

These define the taste profile. A listing with keywords like "Marlin", "DeKalb", "NOS", or "1970s" scores higher. A plain Easy Reader scores lower. The result is a ranked feed of **candidates** — listings that pass all rules and score well.

## How It Works

```
1. SYNC      Pull listings from eBay + Etsy (via Olostep scraping API)
                ↓
2. NORMALIZE  Convert to CAD, calculate total cost (price + shipping)
                ↓
3. FILTER     Drop broken items and anything over $50
                ↓
4. SCORE      Rank by interestingness (keyword heuristics or LLM)
                ↓
5. SURFACE    Show candidates first, with scores, tags, and rationale
```

**Sync** runs on a daily cron (Vercel) or manually via the dashboard. Each sync pulls sequentially from marketplace adapters — eBay and Etsy are live via Olostep; Chrono24 is stubbed (no public API). If all live adapters return zero listings and none errored, sample data fills the demo. When live adapters find real listings, stale demo data is purged. If an adapter failed, the failure is surfaced in the UI with amber warning banners.

**Scoring** has two modes:
- **Keyword scorer** (default): A weighted rule set derived from the taste profile. Zero API cost, <1ms per listing, deterministic, fully auditable.
- **LLM scorer** (opt-in via `ENABLE_AI_SCORING=true`): GPT-4o-mini with structured output. Falls back to keywords on failure.

The keyword scorer is the default by design — see [ADR 0003](docs/adr/0003-keyword-scorer-default.md). The LLM path is the upgrade for more nuanced taste.

## Key Decisions

Each is documented as an ADR in [docs/adr/](docs/adr/).

- **Olostep over official APIs.** eBay Browse API approval was unavailable; Olostep handles JS rendering, proxies, and anti-bot. We parse the markdown ourselves — deterministic, testable, zero LLM cost.
- **Rules separate from scoring.** Cost and condition are binary gates; taste is subjective. An LLM can never override a budget constraint.
- **Taste Profile in the UI.** "Interesting" is subjective. Showing the reference purchases makes scoring transparent and grounded.
- **No Chrono24.** No public API, aggressive bot blocking. The adapter interface is ready when a scraping path becomes viable.

## Tradeoffs

- **Shipping estimates aren't perfect.** Olostep extracts what's visible on the search results page. Calculated shipping may not be shown until checkout. Unknown shipping is treated as $0 for the cost rule, but the UI labels it "shipping TBD" so the collector knows the total is a floor estimate, not exact.
- **No auth / multi-user.** This is a single-collector tool. Auth adds complexity without product value.
- **Sample data is a fallback, not always-on.** When live adapters find listings, sample data is skipped entirely. Sample data only kicks in when all adapters genuinely find nothing *and* no errors occurred. If adapters fail (Olostep down, rate-limited), the failure is reported instead of silently masking it with demo data.
- **Sync is credit-protected.** Both manual and cron sync require `CRON_SECRET` when set, and a server-side 5-minute cooldown prevents accidental rapid syncs. The UI confirm dialog is a secondary safeguard.

## What I'd Do Next

- **Image-based model identification.** Use vision models to identify the specific Timex reference from listing photos — would dramatically improve scoring accuracy beyond title keywords.
- **Price alerts.** Track listings over time; notify when something drops into budget range.
- **Watchlist.** Let the collector save candidates, track if they sell.
- **Chrono24 via Olostep.** Now that we have the scraping infra, try Chrono24 search results.
- **Taste profile editing.** Let the collector add/remove reference purchases to refine what "interesting" means.

## Setup

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project
- [Olostep](https://olostep.com) API key (for eBay/Etsy scraping)
- [OpenAI](https://platform.openai.com) API key (optional, for LLM scoring)

### Install

```bash
npm install
```

### Database

Run `supabase/migration.sql` in your Supabase SQL editor. This creates the `listings` and `sync_runs` tables.

### Environment

```bash
cp .env.example .env.local
```

| Variable | Required | Source |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Settings → API |
| `OLOSTEP_API_KEY` | Yes | Olostep dashboard |
| `OPENAI_API_KEY` | No | OpenAI platform (only if `ENABLE_AI_SCORING=true`) |
| `ENABLE_AI_SCORING` | No | Set to `true` to use LLM scorer |
| `CRON_SECRET` | No | Shared secret protecting sync endpoints |
| `NEXT_PUBLIC_SYNC_SECRET` | No | Must match `CRON_SECRET` — lets UI trigger sync |

### Run

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Click **Sync Now** to pull listings.

### Deploy

```bash
npx vercel
```

Set env vars in the Vercel dashboard. The cron job syncs daily at 14:00 UTC (`vercel.json`).

## Verification

Everything below can be verified **without Olostep credits** — the test suite uses mocks and fixtures.

```bash
npm test          # 119 unit tests across 10 files
npx tsc --noEmit  # TypeScript strict type-check
npm run lint      # ESLint
npm run build     # Full Next.js production build
```

### What the tests cover

| Area | Tests | Key assertions |
|------|-------|---------------|
| eBay markdown parser | `ebay-parse.test.ts` | Plain links, image-wrapped links (live format), prices, shipping, condition, images, deduplication |
| Etsy markdown parser | `etsy-parse.test.ts` | Plain links, image-wrapped links, block-based multi-line format (live), sale prices, CA$/$ formats |
| Image extraction | `parse-images.test.ts` | eBay/Etsy image URL extraction, HTML enrichment |
| Normalization + rules | `normalize.test.ts` | CAD conversion, $50 budget rule, broken detection, shippingUnknown flag |
| Condition detection | `condition.test.ts` | "For parts" = broken; "needs battery" = OK |
| Currency conversion | `currency.test.ts` | Static FX rates, unknown-currency fallback |
| Keyword scorer | `scorer.test.ts` | Rule weights, tag assignment, rationale text |
| Sync pipeline | `sync.test.ts` | Adapter error vs empty, sample fallback logic, pass/exclude split, exception handling |
| Olostep client | `olostep.test.ts` | Request shape, auth header, error responses, missing key, hosted URL fallback, page status check, new scrape options |
| Sync status | `sync-status.test.ts` | Row mapping |

### What requires live credentials

- Triggering a real sync → needs `OLOSTEP_API_KEY` + Supabase keys
- LLM scoring → needs `OPENAI_API_KEY` + `ENABLE_AI_SCORING=true`
- Vercel cron → auto-set on Vercel deploy

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── listings/route.ts      # Filterable listing query
│   │   ├── sync/route.ts          # Trigger sync pipeline (auth-protected)
│   │   └── sync-status/route.ts   # Sync history + counts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Dashboard.tsx              # Main orchestrator
│   ├── ReferenceCollection.tsx    # Taste profile display
│   ├── SyncStatus.tsx             # Sync indicator + cooldown
│   └── ui/                        # ListingImage, ScoreBadge, TagList, SourceBadge, etc.
├── features/listings/
│   ├── ListingCard.tsx            # Listing grid card
│   ├── ListingDrawer.tsx          # Detail panel
│   ├── ListingGrid.tsx            # Responsive grid
│   └── FilterBar.tsx              # Filter / sort / source
├── hooks/
│   ├── useListings.ts             # Client data fetching
│   └── useSync.ts                 # Sync trigger + status
└── lib/
    ├── adapters/
    │   ├── index.ts               # Adapter registry
    │   ├── ebay.ts                # eBay via Olostep markdown
    │   ├── etsy.ts                # Etsy via Olostep markdown
    │   ├── chrono24.ts            # Stub (no public API)
    │   ├── sample.ts              # Demo fallback data
    │   └── parse-images.ts        # Image URL extraction + HTML enrichment
    ├── __tests__/                 # 10 test files
    ├── types.ts                   # TypeScript types
    ├── olostep.ts                 # Olostep API client
    ├── supabase.ts                # Supabase service client
    ├── listings.ts                # DB persistence + queries
    ├── normalize.ts               # Normalization + rule filters
    ├── condition.ts               # Broken / battery detection
    ├── currency.ts                # Static CAD conversion
    ├── scorer.ts                  # Keyword + LLM scoring
    ├── taste-profile.ts           # Reference purchases + taste summary
    ├── image-loader.ts            # Next.js image config helper
    └── sync.ts                    # Sync pipeline orchestrator
```
