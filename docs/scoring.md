# Scoring

Scoring determines how interesting a listing is to the collector. It runs only on listings that passed all rules (cost ≤ $50 CAD, not broken).

## Taste profile

**Source of truth:** `src/lib/taste-profile.ts`

The taste profile is anchored on three actual reference purchases that define the collector's preferences:

| Reference | Why it matters |
|-----------|---------------|
| Timex Marlin Mechanical (1970s) | Vintage hand-wind dress watches |
| Timex Breyers Ice Cream Watch | Vintage promotional / brand collaboration pieces |
| Timex DeKalb Corn Watch (NOS) | Rare promotional items, deadstock/NOS condition |

The file exports:
- **`TASTE_PROFILE`** — Full metadata for each reference buy (listing data, short title, note, total price). Used by the UI's ReferenceCollection component.
- **`REFERENCE_BUYS`** — Just the `RawListing` objects, used by the sample adapter.
- **`TASTE_SUMMARY`** — A natural-language summary of the collector's taste, injected into the LLM scorer's system prompt.

## Keyword scorer (default)

**File:** `src/lib/scorer.ts`

A weighted rule table derived from the taste profile. Each rule is a regex pattern with a point value and tag:

| Category | Patterns | Points | Tag |
|----------|----------|--------|-----|
| Collaborations | todd snyder, peanuts/snoopy, cabourn, end., dekalb, breyers, collab | +15 to +25 | `collab` |
| Deadstock/NOS | deadstock, dead stock, nos, new old stock, nwt | +10 to +25 | `deadstock`, `nos` |
| Vintage models | marlin, electric, dynabeat, mercury, viscount, waterbury | +8 to +25 | `vintage`, `rare-model` |
| Vintage era | 196x/197x decade, mechanical, hand-wind, automatic, vintage | +8 to +15 | `vintage` |
| Reissues | q timex, reissue, pepsi | +10 to +15 | `reissue` |
| Military/field | military, field, camper, mk1, expedition | +5 to +12 | `military` |
| Other styles | diver/diving, dress, ironman/triathlon | +3 to +8 | `diver`, `dress`, `vintage` |
| Negative | easy reader, weekender, band/strap only | -10 to -15 | (none) |
| Limited edition | limited edition | +15 | `limited-edition` |

**Price bonus:** Listings under $20 CAD total get +10 points; under $35 gets +5.

**Base score:** 30 (before any rules apply).

**Score range:** Clamped to 0–100.

**Rationale:** Generated from the final score and matched tags. Higher scores get more specific rationale text.

## LLM scorer (opt-in)

Enabled by setting `ENABLE_AI_SCORING=true` in the environment.

Uses GPT-4o-mini via AI SDK's `generateObject()` with structured output (Zod schema). The system prompt includes `TASTE_SUMMARY` and instructs the model to score 0–100 and return tags and a rationale.

On failure, falls back to the keyword scorer with a console warning.

**Input:** title, condition, total cost in CAD, source marketplace.

**Output:** Same `InterestResult` shape as the keyword scorer: `{ score, tags, rationale }`.

## Candidate threshold

**Constant:** `CANDIDATE_THRESHOLD = 55` (defined in `src/lib/normalize.ts`)

A listing with `interestScore >= 55` becomes a candidate (`is_candidate: true`). The threshold applies identically regardless of scoring mode.
