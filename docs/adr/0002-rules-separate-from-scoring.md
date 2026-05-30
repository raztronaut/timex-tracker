# ADR 0002: Rules separate from scoring

## Status

Accepted

## Context

The brief asks to filter by total cost (<$50 CAD) and exclude broken items, while also scoring listings for interestingness. These are fundamentally different operations: cost and condition are objective facts; interestingness is subjective taste.

## Decision

Rules and scoring are separate pipeline stages with no overlap.

**Rules** (`passesRules()` in `normalize.ts`) are binary gates — a listing either passes or it doesn't. Currently: `totalCostCad <= 50` and `!isBroken`. Rules run before scoring and cannot be overridden by a high interest score.

**Scoring** (`scorer.ts`) only runs on listings that passed all rules. It produces a 0–100 score, tags, and a rationale. Listings above `CANDIDATE_THRESHOLD` (55) become candidates.

## Consequences

- An LLM scorer cannot override a budget constraint, even if it thinks a $200 watch is very interesting.
- Excluded listings are still persisted (with `is_candidate: false` and a rationale) so the collector can see what was filtered out.
- Adding a new rule is a one-line change to `passesRules()`. Adding taste nuance goes in the scorer.
