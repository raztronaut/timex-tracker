# Development Guide

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Olostep](https://olostep.com) API key (for live marketplace scraping)
- Optionally, an [OpenAI](https://platform.openai.com) API key (for LLM scoring)

## Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in the values in `.env.local`. See the environment variable table in [README.md](../README.md#environment) for what each variable does.

Run the database migration in your Supabase SQL editor:

```bash
# Copy the contents of supabase/migration.sql and run in Supabase Dashboard → SQL Editor
```

Start the dev server:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Safe development

**Tests never burn Olostep credits.** All adapter and sync tests mock the scrape layer. Run `npm test` freely.

**Live sync requires credentials.** To trigger a real sync, you need `OLOSTEP_API_KEY` set in `.env.local`. The sync endpoint also requires `CRON_SECRET` when that variable is set — the UI passes it via `NEXT_PUBLIC_SYNC_SECRET` (which must match `CRON_SECRET`).

**5-minute cooldown.** The sync API enforces a server-side cooldown between runs to prevent accidental rapid syncs. The UI confirm dialog is a secondary safeguard.

## Verification commands

```bash
npm test          # 98 unit tests across 10 files (vitest)
npx tsc --noEmit  # TypeScript strict type-check
npm run lint      # ESLint
npm run build     # Full Next.js production build
```

All of these work without any API keys or database connection.

## Test structure

Tests live in `src/lib/__tests__/` and use vitest. Each test file corresponds to a library module. This table is the canonical test inventory — README summarizes it.

| Test file | Module under test | Key assertions |
|-----------|-------------------|----------------|
| `ebay-parse.test.ts` | `adapters/ebay.ts` | Title/price/shipping/image extraction, deduplication, edge formats |
| `etsy-parse.test.ts` | `adapters/etsy.ts` | Same as eBay, plus CA$/$ price formats |
| `parse-images.test.ts` | `adapters/parse-images.ts` | eBay/Etsy image URL extraction, HTML enrichment |
| `normalize.test.ts` | `normalize.ts` | CAD conversion, $50 budget rule, broken detection, shippingUnknown flag |
| `condition.test.ts` | `condition.ts` | "For parts" = broken; "needs battery" = OK |
| `currency.test.ts` | `currency.ts` | Static FX rates, unknown-currency fallback |
| `scorer.test.ts` | `scorer.ts` | Rule weights, tag assignment, rationale text |
| `sync.test.ts` | `sync.ts` | Adapter error vs empty, sample fallback logic, pass/exclude split |
| `olostep.test.ts` | `olostep.ts` | Request shape, auth header, error responses, missing key |
| `sync-status.test.ts` | `sync-status.ts` | Row mapping |

When adding tests, mock external dependencies (Olostep, Supabase) — never make real API calls.

## Debugging sync

1. Check `sync_runs` in Supabase to see recent sync history, per-adapter counts, and error states.
2. The `/api/sync-status` endpoint returns the last 10 runs and aggregate counts.
3. Adapter errors surface in the `SyncResult` objects returned by `/api/sync` and are visible in the dashboard.
4. Olostep failures log to server console — check Vercel function logs in production.

## Deploy

```bash
npx vercel
```

Set environment variables in the Vercel dashboard. The cron job is configured in `vercel.json` and runs daily at 14:00 UTC:

```json
{
  "crons": [{ "path": "/api/sync", "schedule": "0 14 * * *" }]
}
```

Vercel cron calls the GET handler on `/api/sync`, which requires `CRON_SECRET` if set.
