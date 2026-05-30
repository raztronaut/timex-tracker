"use client";

export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
        —
      </span>
    );
  }

  let bg: string;
  let text: string;
  let label: string;

  if (score >= 80) {
    bg = "bg-emerald-100";
    text = "text-emerald-800";
    label = "Hot";
  } else if (score >= 60) {
    bg = "bg-amber-100";
    text = "text-amber-800";
    label = "Solid";
  } else if (score >= 40) {
    bg = "bg-stone-100";
    text = "text-stone-700";
    label = "OK";
  } else {
    bg = "bg-stone-50";
    text = "text-stone-500";
    label = "Meh";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
    >
      <span className="font-mono">{score}</span>
      <span className="font-normal">{label}</span>
    </span>
  );
}
