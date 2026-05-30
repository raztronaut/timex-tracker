# ADR 0004: Sample data fallback semantics

## Status

Accepted

## Context

The demo must always have data to show, but sample data should never hide a real adapter failure. The question is when to use it.

## Decision

Sample data runs **only** when all live adapters returned zero listings **and** none of them reported an error. This means:

- Genuinely empty search results → sample data fills the demo.
- Olostep down or rate-limited → error is reported, no sample fallback.
- One adapter errors but another finds listings → no fallback needed.

The sample adapter is not in `liveAdapters`. It is invoked separately in `runFullSync()` after checking the results.

Sample listings have `source: "sample"` and `sourceId` prefixed with `sample-` so they're visually distinguishable in the UI.

## Consequences

- Adapter failures are never silently masked — the collector sees that something went wrong.
- Sample data includes intentionally diverse listings (candidates, broken items, over-budget items) to demonstrate the full pipeline.
