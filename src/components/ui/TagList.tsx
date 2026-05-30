const TAG_STYLES: Record<string, string> = {
  collab: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
  deadstock: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  nos: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  vintage: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
  "rare-model": "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
  reissue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
  "limited-edition": "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
  military: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20",
  diver: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20",
  dress: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border border-zinc-500/20",
};

export function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium border ${
            TAG_STYLES[tag] || "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
