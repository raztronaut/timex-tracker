# ADR 0001: Olostep scraping over official marketplace APIs

## Status

Accepted

## Context

The eBay Browse API requires developer account approval that was unavailable during development. Etsy's API has rate limits and requires OAuth. Chrono24 has no public API at all. We needed a way to pull search results from at least two marketplaces without waiting for API approvals.

## Decision

Use Olostep (a scraping-as-a-service API) to fetch marketplace search result pages as rendered markdown, then parse the markdown ourselves. Each adapter constructs a search URL with appropriate query params (price cap, condition filters, locale) and sends it to `scrape()` in `src/lib/olostep.ts`.

We chose markdown output over LLM-based extraction because:
- Markdown parsing is deterministic, testable with fixtures, and costs zero LLM credits.
- Each Olostep API call costs credits regardless of extraction format — markdown is the cheapest.
- We control the parsing logic and can fix it when marketplace HTML changes.

## Consequences

- Parsers are fragile to marketplace layout changes. Tests use markdown fixtures so regressions are caught early.
- `OLOSTEP_API_KEY` is required for live data. All tests mock the scrape layer so development never burns credits.
- Shipping data is limited to what appears on search result pages, not checkout-time calculations.
- Adding a new marketplace means writing a new markdown parser, not learning a new API.
