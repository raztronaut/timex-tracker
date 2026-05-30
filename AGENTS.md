# Timex Tracker — Agent Guide

Vintage Timex listing tracker: sync from marketplaces → normalize → apply rules → score for interestingness → persist to Supabase.

## Read order

1. **This file** — constraints, commands, edit map.
2. **[CONTEXT.md](CONTEXT.md)** — domain vocabulary. Use these terms in code and conversations.
3. **[docs/architecture.md](docs/architecture.md)** — pipeline, module responsibilities, data flow, failure modes.
4. **Task-specific docs:**
   - Adapters / parsers → [docs/adapters.md](docs/adapters.md)
   - Scoring / taste profile → [docs/scoring.md](docs/scoring.md)
   - Database schema / persistence → [docs/database.md](docs/database.md)
   - API routes → [docs/api.md](docs/api.md)
   - Local dev / deploy / testing → [docs/development.md](docs/development.md)
5. **[docs/adr/](docs/adr/)** — settled architectural decisions. Do not re-litigate without good reason.

Product narrative lives in `README.md` — don't duplicate it here.

## Hard constraints

- **Do not run live `/api/sync` without credentials.** Olostep credits are real money. Tests mock the scrape layer — use `npm test` freely.
- **Respect `CRON_SECRET`.** Both manual and cron sync require this header when set. The 5-minute server-side cooldown prevents accidental rapid syncs.
- **Do not commit secrets.** `.env.local` and `.env` are gitignored. Environment variables belong in `.env.example` (placeholder values only).

## Commands

```bash
npm test          # 119 unit tests (vitest), all mocked — safe and free
npx tsc --noEmit  # TypeScript strict type-check
npm run lint      # ESLint
npm run build     # Full Next.js production build
npm run dev       # Local dev server (needs Supabase env vars for data)
```

## Next.js 16

This project uses Next.js 16 with breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Where to edit

| Task | Files |
|------|-------|
| Add/fix a marketplace adapter | `src/lib/adapters/` + parser tests in `src/lib/__tests__/` |
| Image parsing / enrichment | `src/lib/adapters/parse-images.ts`, `src/lib/__tests__/parse-images.test.ts` |
| Image loading / display | `src/lib/image-loader.ts`, `src/components/ui/ListingImage.tsx` |
| Change scoring rules or weights | `src/lib/scorer.ts` |
| Update taste profile / reference buys | `src/lib/taste-profile.ts` |
| Modify filter rules (cost, broken) | `src/lib/normalize.ts`, `src/lib/condition.ts` |
| Change currency rates | `src/lib/currency.ts` |
| Database schema | `supabase/migration.sql` (run manually in Supabase SQL editor) |
| Row mapping (camelCase ↔ snake_case) | `src/lib/listings.ts` |
| Sync pipeline logic | `src/lib/sync.ts` |
| API routes | `src/app/api/` |
| UI components | `src/features/listings/` (listing-specific), `src/components/` (shared) |
| Client-side data fetching | `src/hooks/` |

## Doc maintenance

When you make changes, keep docs in sync:

| Change type | Update |
|-------------|--------|
| New domain concept | Add to `CONTEXT.md` |
| Architectural decision | Add to `docs/adr/` |
| Pipeline or module boundaries | Update `docs/architecture.md` |
| User-visible product behavior | Update `README.md` and the relevant `docs/*.md` |
| New environment variable | Add to `.env.example`, `README.md` env table, `docs/development.md` |
