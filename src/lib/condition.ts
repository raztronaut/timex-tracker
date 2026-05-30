const BROKEN_PATTERNS = [
  /\bfor\s+parts\b/i,
  /\bnot\s+working\b/i,
  /\bbroken\b/i,
  /\bas[\s-]is\b/i,
  /\bdoesn'?t\s+(work|run|tick)\b/i,
  /\bdefective\b/i,
  /\bdamaged\b/i,
  /\bjunk\b/i,
];

const BATTERY_OK_PATTERNS = [
  /\bneeds?\s+(a\s+)?batter(y|ies)\b/i,
  /\bbattery\s+(needed|dead|replace)/i,
  /\bnew\s+battery\b/i,
];

export function isBroken(condition: string, title: string): boolean {
  const text = `${condition} ${title}`;

  if (BATTERY_OK_PATTERNS.some((p) => p.test(text))) {
    return false;
  }

  return BROKEN_PATTERNS.some((p) => p.test(text));
}
