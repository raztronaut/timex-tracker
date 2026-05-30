# ADR 0003: Keyword scorer as default, LLM opt-in

## Status

Accepted

## Context

The taste profile is subjective — "interesting" means different things to different collectors. An LLM can capture nuance (case size preferences, dial aesthetics), but for a single-collector tool syncing ~50 listings a few times a day, LLM credits are wasteful when simple keyword heuristics work surprisingly well.

## Decision

The keyword scorer is the default (`ENABLE_AI_SCORING` unset or `false`). It uses a weighted rule table derived from the taste profile — pattern matches on title and condition text, price bonuses, deterministic rationale generation. Runs in <1ms per listing, costs nothing, and is fully auditable.

The LLM scorer (GPT-4o-mini via AI SDK structured output) is opt-in via `ENABLE_AI_SCORING=true`. It receives the taste summary as system context and returns the same `InterestResult` shape. On failure, it falls back to the keyword scorer.

## Consequences

- Default operation requires zero API keys beyond Olostep and Supabase.
- Keyword scores are deterministic — same listing always gets the same score.
- The LLM path is the upgrade for more nuanced taste (e.g., case size preferences) but costs money per sync.
- Both scorers produce the same `InterestResult` shape, so the UI and persistence layer are scoring-mode-agnostic.
