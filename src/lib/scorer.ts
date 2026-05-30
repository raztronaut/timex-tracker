import type { InterestResult } from "./types";

// --- Keyword-based scorer (default, zero API cost) ---

interface ScoringRule {
  pattern: RegExp;
  points: number;
  tag: string;
}

const RULES: ScoringRule[] = [
  { pattern: /\bmarlin\b/i, points: 20, tag: "vintage" },
  { pattern: /\belectric\b/i, points: 15, tag: "vintage" },
  { pattern: /\bdynabeat\b/i, points: 20, tag: "rare-model" },
  { pattern: /\bmercury\b/i, points: 18, tag: "vintage" },
  { pattern: /\bviscount\b/i, points: 18, tag: "vintage" },
  { pattern: /\bq\s*timex\b/i, points: 15, tag: "reissue" },
  { pattern: /\breissue\b/i, points: 15, tag: "reissue" },
  { pattern: /\bpepsi\b/i, points: 10, tag: "reissue" },
  { pattern: /\btodd\s*snyder\b/i, points: 25, tag: "collab" },
  { pattern: /\bpeanuts\b|snoopy/i, points: 20, tag: "collab" },
  { pattern: /\bcabourn\b/i, points: 20, tag: "collab" },
  { pattern: /\bend\.\b|end\s+clothing/i, points: 18, tag: "collab" },
  { pattern: /\bcollab/i, points: 15, tag: "collab" },
  { pattern: /\blimited\s*(edition)?\b/i, points: 15, tag: "limited-edition" },
  { pattern: /\b(deadstock|dead\s*stock)\b/i, points: 25, tag: "deadstock" },
  { pattern: /\b(nos|new\s+old\s+stock)\b/i, points: 25, tag: "nos" },
  { pattern: /\bnwt\b|new\s+with\s+tags/i, points: 10, tag: "nos" },
  { pattern: /\bvintage\b/i, points: 10, tag: "vintage" },
  { pattern: /\b19[67]\d/i, points: 15, tag: "vintage" },
  { pattern: /\bmechanical\b/i, points: 12, tag: "vintage" },
  { pattern: /\bhand[\s-]?wind/i, points: 12, tag: "vintage" },
  { pattern: /\bautomatic\b/i, points: 8, tag: "vintage" },
  { pattern: /\bmilitary\b|\bfield\b|\bcamper\b/i, points: 12, tag: "military" },
  { pattern: /\bmk1\b/i, points: 10, tag: "military" },
  { pattern: /\bexpedition\b/i, points: 5, tag: "military" },
  { pattern: /\bdiver\b|\bdiving\b/i, points: 8, tag: "diver" },
  { pattern: /\bdress\b/i, points: 5, tag: "dress" },
  { pattern: /\bwaterbury\b/i, points: 8, tag: "vintage" },
  { pattern: /\biroman\b|\btriathlon\b/i, points: 3, tag: "vintage" },
  { pattern: /\beasy\s*reader\b/i, points: -10, tag: "" },
  { pattern: /\bweekender\b/i, points: -10, tag: "" },
  { pattern: /\bband\s*only\b|\bstrap\s*only\b/i, points: -15, tag: "" },
];

function buildRationale(tags: string[], score: number): string {
  if (score >= 80) {
    if (tags.includes("collab")) return "Rare collaboration piece — high collector interest";
    if (tags.includes("deadstock") || tags.includes("nos"))
      return "New old stock / deadstock — exceptional condition for the age";
    if (tags.includes("rare-model")) return "Uncommon reference that doesn't come up often";
    return "Strong vintage piece with multiple desirable attributes";
  }
  if (score >= 60) {
    if (tags.includes("vintage")) return "Solid vintage Timex — a good pickup at this price";
    if (tags.includes("reissue")) return "Reissue of a classic model — nice modern take";
    return "Interesting piece worth a closer look";
  }
  if (score >= 40) return "Decent listing but nothing extraordinary";
  if (score >= 20) return "Common model — only worth it if the price is right";
  return "Not particularly interesting for this collection";
}

interface ScoringInput {
  title: string;
  conditionRaw: string;
  totalCostCad: number;
  source: string;
}

function scoreWithKeywords(listing: ScoringInput): InterestResult {
  const text = `${listing.title} ${listing.conditionRaw}`;
  let rawScore = 30;
  const matchedTags = new Set<string>();

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      rawScore += rule.points;
      if (rule.tag) matchedTags.add(rule.tag);
    }
  }

  if (listing.totalCostCad <= 20) rawScore += 10;
  else if (listing.totalCostCad <= 35) rawScore += 5;

  const score = Math.max(0, Math.min(100, rawScore));
  const tags = Array.from(matchedTags);
  return { score, tags, rationale: buildRationale(tags, score) };
}

// --- LLM scorer (opt-in via ENABLE_AI_SCORING=true) ---

async function scoreWithAI(listing: ScoringInput): Promise<InterestResult> {
  const { generateObject } = await import("ai");
  const { openai } = await import("@ai-sdk/openai");
  const { z } = await import("zod");

  const schema = z.object({
    score: z.number().int().min(0).max(100),
    tags: z.array(z.string()),
    rationale: z.string(),
  });

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema,
    system: `You are a vintage Timex watch collecting expert. The collector loves:
- 1960s-80s vintage (Marlin, Mercury, Viscount, Electric, Dynabeat)
- Collaborations (Todd Snyder, Peanuts/Snoopy, Nigel Cabourn, END.)
- Deadstock/NOS finds, reissues (Q Timex, Marlin reissue)
- Military/field watches (Camper, MK1)
Score 0-100. Tags: collab, deadstock, nos, vintage, rare-model, reissue, limited-edition, military, diver, dress. Be opinionated.`,
    prompt: `Title: ${listing.title}\nCondition: ${listing.conditionRaw}\nTotal: $${listing.totalCostCad} CAD\nSource: ${listing.source}`,
  });

  return { score: object.score, tags: object.tags, rationale: object.rationale };
}

// --- Public API ---

const USE_AI = process.env.ENABLE_AI_SCORING === "true";

export async function scoreListing(listing: ScoringInput): Promise<InterestResult> {
  if (!USE_AI) {
    return scoreWithKeywords(listing);
  }

  try {
    return await scoreWithAI(listing);
  } catch (err) {
    console.warn("AI scorer failed, falling back to keywords:", (err as Error).message);
    return scoreWithKeywords(listing);
  }
}

export async function scoreListingsBatch(listings: ScoringInput[]): Promise<InterestResult[]> {
  return Promise.all(listings.map(scoreListing));
}
