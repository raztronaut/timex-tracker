const TAG_STYLES: Record<string, string> = {
  collab: "bg-purple-950/40 text-purple-300 border border-purple-900/30",
  deadstock: "bg-emerald-950/40 text-emerald-300 border border-emerald-900/30",
  nos: "bg-emerald-950/40 text-emerald-300 border border-emerald-900/30",
  vintage: "bg-amber-950/40 text-amber-300 border border-amber-900/30",
  "rare-model": "bg-rose-950/40 text-rose-300 border border-rose-900/30",
  reissue: "bg-blue-950/40 text-blue-300 border border-blue-900/30",
  "limited-edition": "bg-purple-950/40 text-purple-300 border border-purple-900/30",
  military: "bg-green-950/40 text-green-300 border border-green-900/30",
  diver: "bg-cyan-950/40 text-cyan-300 border border-cyan-900/30",
  dress: "bg-stone-900/50 text-stone-300 border border-stone-800",
};

export function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium border ${
            TAG_STYLES[tag] || "bg-stone-900/40 text-stone-300 border-stone-800"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
