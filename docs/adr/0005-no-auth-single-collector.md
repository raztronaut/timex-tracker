# ADR 0005: No auth / single-collector scope

## Status

Accepted

## Context

The brief describes a tool for a specific collector with a specific taste profile. Adding user auth, profile management, and per-user taste profiles would add significant complexity without product value for the single-user case.

## Decision

No authentication layer. The app serves one collector. The taste profile is hardcoded in `src/lib/taste-profile.ts`. The sync endpoints are protected by `CRON_SECRET` (to prevent unauthorized credit burn), but there is no user login.

## Consequences

- The taste profile is a code change, not a settings page. Acceptable for one collector; would not scale to multiple users.
- `CRON_SECRET` provides operational protection (preventing anonymous Olostep credit burn) without user identity.
- Multi-user support would require: auth layer, per-user taste profiles, per-user sync runs, and row-level security in Supabase.
