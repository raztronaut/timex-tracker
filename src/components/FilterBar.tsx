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
  { value: "interest_score", label: "Interest" },
  { value: "total_cost_cad", label: "Price: Low" },
  { value: "last_seen_at", label: "Newest" },
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
      <div className="flex rounded-lg border border-stone-200 bg-white p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 outline-none"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            Sort: {s.label}
          </option>
        ))}
      </select>

      <select
        value={source}
        onChange={(e) => onSourceChange(e.target.value)}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 outline-none"
      >
        {SOURCES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
