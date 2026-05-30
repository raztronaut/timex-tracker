import { Badge } from "./Badge";

const SCORE_TIERS = [
  { min: 80, variant: "success" as const, label: "Hot" },
  { min: 60, variant: "warning" as const, label: "Solid" },
  { min: 40, variant: "default" as const, label: "OK" },
  { min: -Infinity, variant: "subtle" as const, label: "Meh" },
];

export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge className="font-medium">—</Badge>;
  }

  const tier = SCORE_TIERS.find((t) => score >= t.min)!;

  return (
    <Badge variant={tier.variant} className="gap-1 px-2.5 font-semibold">
      <span className="font-mono tabular-nums">{score}</span>
      <span className="font-normal">{tier.label}</span>
    </Badge>
  );
}
