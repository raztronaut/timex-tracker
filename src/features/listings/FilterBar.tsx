"use client";

interface FilterBarProps {
  filter: string;
  sort: string;
  source: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onSourceChange: (source: string) => void;
}

const FILTERS = [
  { value: "candidates", label: "Candidates" },
  { value: "all", label: "All Listings" },
  { value: "excluded", label: "Excluded" },
];

const SORTS = [
  { value: "interest_score", label: "Sort: Interest" },
  { value: "total_cost_cad", label: "Sort: Price (Low)" },
  { value: "last_seen_at", label: "Sort: Newest" },
];

const SOURCES = [
  { value: "", label: "All Sources" },
  { value: "ebay", label: "eBay" },
  { value: "etsy", label: "Etsy" },
];

export function FilterBar({
  filter,
  sort,
  source,
  onFilterChange,
  onSortChange,
  onSourceChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Tab Filter List */}
      <div
        role="tablist"
        aria-label="Listing filter"
        className="flex rounded-xl bg-card/90 p-0.5 border border-card-border shadow-[var(--shadow-border)]"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => onFilterChange(f.value)}
            className={`rounded-lg px-3.5 py-1.25 text-xs font-semibold tracking-tight transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.96] border ${
              filter === f.value
                ? "bg-background border-card-border/60 text-foreground shadow-sm font-bold"
                : "text-muted hover:text-foreground border-transparent hover:bg-card-border/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Custom styled select boxes with custom SVG drop arrows */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort order"
          className="appearance-none rounded-lg bg-card border border-card-border hover:border-muted/50 hover:bg-card/85 px-4 pr-9 py-2 text-xs font-semibold text-foreground shadow-sm outline-none transition-[border-color,background-color] duration-150 ease-out focus:ring-1 focus:ring-accent/40 cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.6rem_auto] bg-[right_0.75rem_center] bg-no-repeat"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value} className="bg-card text-foreground">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <select
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          aria-label="Marketplace source"
          className="appearance-none rounded-lg bg-card border border-card-border hover:border-muted/50 hover:bg-card/85 px-4 pr-9 py-2 text-xs font-semibold text-foreground shadow-sm outline-none transition-[border-color,background-color] duration-150 ease-out focus:ring-1 focus:ring-accent/40 cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.6rem_auto] bg-[right_0.75rem_center] bg-no-repeat"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value} className="bg-card text-foreground">
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
