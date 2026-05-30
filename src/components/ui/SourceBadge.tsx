import { Badge } from "./Badge";

const SOURCE_CONFIG: Record<string, { variant: "info" | "orange" | "default"; label: string }> = {
  ebay: { variant: "info", label: "eBay" },
  etsy: { variant: "orange", label: "Etsy" },
  chrono24: { variant: "default", label: "Chrono24" },
  sample: { variant: "default", label: "Demo" },
};

export function SourceBadge({ source }: { source: string }) {
  const config = SOURCE_CONFIG[source];
  return (
    <Badge
      variant={config?.variant ?? "default"}
      className="rounded px-1.5 text-[10px] font-semibold uppercase tracking-wide"
    >
      {config?.label ?? source}
    </Badge>
  );
}
