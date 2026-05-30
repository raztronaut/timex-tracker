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
      className="card-enter group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-card border border-card-border text-left shadow-[var(--shadow-border)] transition-[box-shadow,border-color,background-color,transform] duration-200 ease-out hover:shadow-[var(--shadow-border-hover)] hover:border-muted/50 hover:bg-card-border/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96]"
      style={{
        animationDelay: `${Math.min(index * 60, 480)}ms`,
        contentVisibility: "auto",
        containIntrinsicSize: "0 320px",
      }}
    >
      {listing.isCandidate && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
            Candidate
          </span>
        </div>
      )}

      {!listing.isCandidate &&
        (listing.isBroken || listing.totalCostCad > MAX_TOTAL_COST_CAD) && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="rounded-md bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
              {listing.isBroken ? "Broken" : `Over $${MAX_TOTAL_COST_CAD}`}
            </span>
          </div>
        )}

      {/* Image Container with Top Concentric Radii and subtle outline overlay */}
      <div className="relative aspect-square w-full overflow-hidden bg-card rounded-t-2xl border-b border-card-border/40">
        <ListingImage
          src={imgSrc}
          alt={listing.title}
          fill
          className="object-cover transition-[transform,opacity] duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-90"
        />
        <div className="premium-image-outline" />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground/95">
          {listing.title}
        </h3>

        <div className="flex items-center gap-2">
          <SourceBadge source={listing.source} />
          <ScoreBadge score={listing.interestScore} />
        </div>

        <TagList tags={listing.interestTags} />

        {listing.interestRationale && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted italic text-pretty">
            &ldquo;{listing.interestRationale}&rdquo;
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-base font-bold tracking-tight tabular-nums text-foreground">
              ${listing.totalCostCad.toFixed(2)}
              <span className="ml-1 text-[10px] font-normal text-muted uppercase font-mono">CAD</span>
            </p>
            {listing.shippingCost !== null && listing.shippingCost > 0 && (
              <p className="text-[10px] tabular-nums text-muted">
                ${listing.price.toFixed(2)} + ${listing.shippingCost.toFixed(2)}{" "}
                ship
              </p>
            )}
            {listing.shippingCost === null && (
              <p className="text-[10px] text-muted italic">
                + shipping TBD
              </p>
            )}
          </div>
          
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center gap-1 rounded-md border border-card-border bg-card/65 py-1 pl-2 pr-2.5 text-xs text-foreground/90 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:border-muted/50 hover:bg-card hover:text-foreground active:scale-[0.96]"
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
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card border border-card-border shadow-[var(--shadow-border)]">
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
