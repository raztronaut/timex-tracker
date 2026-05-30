# API Routes

All routes are Next.js App Router route handlers under `src/app/api/`.

## POST /api/sync

Triggers a full sync pipeline across all live adapters.

**Auth:** Requires `Authorization: Bearer {CRON_SECRET}` header when `CRON_SECRET` is set. Returns 401 if the header is missing or wrong.

**Cooldown:** Server-side 5-minute cooldown between syncs (checked against `sync_runs`). Returns 429 if called too soon.

**Response (200):**
```json
{
  "ok": true,
  "results": [
    {
      "source": "ebay",
      "found": 12,
      "passed": 8,
      "excluded": 4,
      "errors": 0,
      "durationMs": 3200
    },
    {
      "source": "etsy",
      "found": 5,
      "passed": 3,
      "excluded": 2,
      "errors": 0,
      "durationMs": 2800
    }
  ]
}
```

**Error responses:**
- `401` — `{ "error": "Unauthorized" }`
- `429` — `{ "ok": false, "error": "Sync cooldown — try again in a few minutes" }`
- `500` — `{ "ok": false, "error": "..." }`

**Timeout:** `maxDuration` is set to 60 seconds (Olostep scraping can be slow).

## GET /api/sync

Same as POST — exists for Vercel cron compatibility. The cron job (configured in `vercel.json`) calls this endpoint daily at 14:00 UTC.

Same auth requirements as POST. Does **not** enforce the 5-minute cooldown (cron runs once daily).

## GET /api/listings

Returns filtered, sorted, paginated listings.

**Query params:**

| Param | Default | Values |
|-------|---------|--------|
| `filter` | `candidates` | `candidates`, `excluded`, `all` |
| `sort` | `interest_score` | `interest_score`, `total_cost_cad`, `last_seen_at`, `price` |
| `source` | (none) | `ebay`, `etsy`, `chrono24`, `sample` |
| `limit` | `100` | Max 200 |
| `offset` | `0` | For pagination |

**Sort direction:** `total_cost_cad` and `price` sort ascending (cheapest first). All others sort descending.

**Response (200):**
```json
{
  "listings": [ /* array of Listing objects */ ],
  "total": 42
}
```

**Error response (500):**
```json
{ "error": "..." }
```

## GET /api/sync-status

Returns recent sync history and aggregate counts. No auth required.

**Response (200):**
```json
{
  "recentRuns": [
    {
      "id": "uuid",
      "startedAt": "2025-05-30T14:00:00Z",
      "finishedAt": "2025-05-30T14:00:05Z",
      "source": "ebay",
      "found": 12,
      "inserted": 8,
      "updated": 4,
      "errors": 0
    }
  ],
  "totalListings": 42,
  "candidateCount": 15
}
```

Returns the 10 most recent sync runs, ordered newest first.

## Agent notes

- Do not call `/api/sync` from automated scripts without `CRON_SECRET`. Each call burns Olostep credits.
- `/api/listings` and `/api/sync-status` are safe to call freely — they only read from Supabase.
