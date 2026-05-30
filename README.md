# Timex Tracker

**[Live Demo →](https://timex-tracker.vercel.app)**

A tool for a vintage Timex collector to stay on top of interesting listings across eBay, Etsy, and other marketplaces — without manually checking each site.

## What It Does

Timex Tracker syncs listings, filters out the noise, and surfaces the few worth paying attention to. It answers one question: **"Is anything good out there right now?"**

**Hard rules** knock out listings that don't fit:
- Total cost (price + shipping to M6K1V8) must be under $50 CAD
- Can't be explicitly broken ("for parts", "not working") — but needing a battery is fine

**Interest scoring** ranks what's left by how much it matches the collector's taste. The scorer is anchored on three actual recent purchases:

| Purchase | Why it matters |
|----------|---------------|
| [Timex Marlin Mechanical (1970s)](https://www.ebay.ca/itm/377073705816) | Loves vintage hand-wind dress watches |
| [Timex Q Reissue (Pepsi bezel)](https://www.ebay.ca/itm/117111976291) | Drawn to reissues of iconic models |
| [Timex Electric Dynabeat (NOS)](https://www.etsy.com/ca/listing/4469739360) | Values deadstock and uncommon references |

These define the taste profile. A listing with keywords like "Marlin", "Todd Snyder collab", "NOS", or "1970s" scores higher. A plain Easy Reader scores lower. The result is a ranked feed of **candidates** — listings that pass all rules and score well.

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

**Sync** runs on a daily cron (Vercel) or manually via the dashboard. Each sync pulls from a pluggable set of marketplace adapters — eBay and Etsy are live via Olostep; Chrono24 is stubbed (no public API); sample data guarantees the demo always works.

**Scoring** has two modes:
- **Keyword scorer** (default): Zero API cost. A weighted rule set derived from the taste profile — `"marlin"` = +20, `"deadstock"` = +25, `"easy reader"` = -10. Instant, deterministic, surprisingly effective.
- **LLM scorer** (opt-in via `ENABLE_AI_SCORING=true`): Uses GPT-4o-mini with structured output. The taste profile is fed as few-shot context. Returns score, tags, and a one-line rationale. Falls back to keywords on failure.

The keyword scorer isn't a compromise — it's a product decision. For a single-collector tool checking 50 listings 4x/day, burning LLM credits on every sync is wasteful. The keyword approach runs in <1ms per listing, costs nothing, and is fully auditable. The LLM is the upgrade path for when the collector wants to support more nuanced taste (e.g., "I prefer 34-36mm cases").

## Key Decisions

**Why Olostep instead of official APIs?** The eBay Browse API requires developer account approval and was unavailable during development. Olostep handles JavaScript rendering, proxy rotation, and anti-bot measures. We scrape search results as markdown and parse them ourselves — cheaper per credit than LLM extraction, more predictable, and gives us full control over the parsing logic.

**Why separate rules from scoring?** Rules are binary gates (cost, condition) that should never be fuzzy. Scoring is subjective (taste). Mixing them would mean an LLM could override a budget constraint. Keeping them separate means the system is auditable: you can always explain why something was included or excluded.

**Why a "Taste Profile" section in the UI?** The brief says "is interesting" — which is subjective. Showing the reference purchases makes the scoring transparent. The collector can see *why* the tool thinks something is interesting, grounded in their own history.

**Why no Chrono24?** No public API. Aggressive bot blocking. The adapter interface is there — adding Chrono24 (or any other marketplace) is a single file implementing `fetchListings(query): Promise<RawListing[]>`.

## Tradeoffs

- **Shipping estimates aren't perfect.** Olostep extracts what's visible on the search results page. Calculated shipping may not be shown until checkout. Unknown shipping is treated as $0, which slightly over-counts candidates.
- **No auth / multi-user.** This is a single-collector tool. Auth adds complexity without product value.
- **Sample data stands in for real listings.** The 3 reference buys are seeded so the demo always has data, even if Olostep is unavailable. They use the real eBay/Etsy source labels.
- **Sync cooldown is a confirm dialog, not a hard block.** The collector should be able to force-sync, but with awareness that it costs credits.

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

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── listings/route.ts      # Filterable listing query
│   │   ├── sync/route.ts          # Trigger sync pipeline
│   │   └── sync-status/route.ts   # Sync history + counts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Dashboard.tsx              # Main orchestrator
│   ├── ReferenceCollection.tsx    # Taste profile display
│   ├── ListingCard.tsx            # Listing grid card
│   ├── ListingDrawer.tsx          # Detail panel
│   ├── FilterBar.tsx              # Filter / sort / source
│   ├── SyncStatus.tsx             # Sync indicator + cooldown
│   ├── ScoreBadge.tsx             # Interest score badge
│   ├── TagList.tsx                # Interest tag pills
│   └── SourceBadge.tsx            # Marketplace badge
└── lib/
    ├── adapters/
    │   ├── index.ts               # Adapter registry
    │   ├── ebay.ts                # eBay via Olostep markdown
    │   ├── etsy.ts                # Etsy via Olostep markdown
    │   ├── chrono24.ts            # Stub (no public API)
    │   └── sample.ts             # Seeded data + reference buys
    ├── types.ts                   # TypeScript types
    ├── olostep.ts                 # Olostep API client
    ├── supabase.ts                # Supabase client
    ├── normalize.ts               # Normalization + rule filters
    ├── condition.ts               # Broken / battery detection
    ├── currency.ts                # CAD conversion
    ├── scorer.ts                  # Keyword + LLM scoring
    └── sync.ts                    # Sync pipeline orchestrator
```
