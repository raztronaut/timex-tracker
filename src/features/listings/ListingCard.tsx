"use client";

import { ExternalLink } from "lucide-react";
import { ScoreBadge, TagList, SourceBadge, ListingImage, Skeleton } from "@/components/ui";
import { MAX_TOTAL_COST_CAD } from "@/lib/normalize";
import type { Listing } from "@/lib/types";
import { memo } from "react";
import type { KeyboardEvent } from "react";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  index?: number;
}

export const ListingCard = memo(function ListingCard({ listing, onSelect, index = 0 }: ListingCardProps) {
  const imgSrc = listing.images?.[0];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(listing);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(listing)}
      onKeyDown={handleKeyDown}
      className="card-enter group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-card border border-zinc-800/80 text-left shadow-sm transition-[box-shadow,border-color,background-color,transform] duration-200 ease-out hover:shadow-md hover:border-zinc-700 hover:bg-zinc-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96]"
      style={{
        animationDelay: `${Math.min(index * 60, 480)}ms`,
        contentVisibility: "auto",
        containIntrinsicSize: "0 320px",
      }}
    >
      {listing.isCandidate && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
            Candidate
          </span>
        </div>
      )}

      {!listing.isCandidate &&
        (listing.isBroken || listing.totalCostCad > MAX_TOTAL_COST_CAD) && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="rounded-md bg-red-950/40 border border-red-900/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">
              {listing.isBroken ? "Broken" : `Over $${MAX_TOTAL_COST_CAD}`}
            </span>
          </div>
        )}

      {/* Image Container with Top Concentric Radii and subtle outline overlay */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950 rounded-t-xl border-b border-zinc-800/40">
        <ListingImage
          src={imgSrc}
          alt={listing.title}
          fill
          className="object-cover transition-[transform,opacity] duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-90"
        />
        <div className="absolute inset-0 rounded-t-xl border border-white/10 pointer-events-none" />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-zinc-50">
          {listing.title}
        </h3>

        <div className="flex items-center gap-2">
          <SourceBadge source={listing.source} />
          <ScoreBadge score={listing.interestScore} />
        </div>

        <TagList tags={listing.interestTags} />

        {listing.interestRationale && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-400 italic text-pretty">
            &ldquo;{listing.interestRationale}&rdquo;
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-base font-bold tracking-tight tabular-nums text-zinc-100">
              ${listing.totalCostCad.toFixed(2)}
              <span className="ml-1 text-[10px] font-normal text-zinc-500 uppercase font-mono">CAD</span>
            </p>
            {listing.shippingCost !== null && listing.shippingCost > 0 && (
              <p className="text-[10px] tabular-nums text-zinc-500">
                ${listing.price.toFixed(2)} + ${listing.shippingCost.toFixed(2)}{" "}
                ship
              </p>
            )}
            {listing.shippingCost === null && (
              <p className="text-[10px] text-zinc-500 italic">
                + shipping TBD
              </p>
            )}
          </div>
          
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 py-1 pl-2 pr-2.5 text-xs text-zinc-300 transition-[background-color,border-color,color] duration-150 ease-out hover:border-zinc-700 hover:bg-zinc-850 hover:text-zinc-100 active:scale-[0.96]"
          >
            <ExternalLink size={11} />
            View
          </a>
        </div>
      </div>
    </div>
  );
});

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card border border-stone-900 shadow-(--shadow-border)">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3.5 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
