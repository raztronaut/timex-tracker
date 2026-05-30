"use client";

const SOURCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ebay: { bg: "bg-blue-100", text: "text-blue-800", label: "eBay" },
  etsy: { bg: "bg-orange-100", text: "text-orange-800", label: "Etsy" },
  chrono24: { bg: "bg-stone-100", text: "text-stone-700", label: "Chrono24" },
};

const DEFAULT_STYLE = { bg: "bg-stone-100", text: "text-stone-600", label: "" };

export function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source] || DEFAULT_STYLE;
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}
    >
      {style.label || source}
    </span>
  );
}
