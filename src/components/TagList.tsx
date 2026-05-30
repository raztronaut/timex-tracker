"use client";

const TAG_STYLES: Record<string, string> = {
  collab: "bg-purple-100 text-purple-800",
  deadstock: "bg-emerald-100 text-emerald-800",
  nos: "bg-emerald-100 text-emerald-800",
  vintage: "bg-amber-100 text-amber-800",
  "rare-model": "bg-rose-100 text-rose-800",
  reissue: "bg-blue-100 text-blue-800",
  "limited-edition": "bg-purple-100 text-purple-800",
  military: "bg-green-100 text-green-800",
  diver: "bg-cyan-100 text-cyan-800",
  dress: "bg-stone-100 text-stone-700",
};

export function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
            TAG_STYLES[tag] || "bg-stone-100 text-stone-600"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
