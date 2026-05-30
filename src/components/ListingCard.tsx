"use client";

import { ExternalLink } from "lucide-react";
import { ScoreBadge } from "./ScoreBadge";
import { TagList } from "./TagList";
import { SourceBadge } from "./SourceBadge";
import type { Listing } from "@/lib/types";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

export function ListingCard({ listing, onSelect }: ListingCardProps) {
  const imgSrc = listing.images?.[0];

  return (
    <button
      onClick={() => onSelect(listing)}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-card-border bg-card text-left shadow-sm transition-all hover:shadow-md hover:border-stone-300"
    >
      {listing.isCandidate && (
        <div className="absolute top-2 left-2 z-10">
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Candidate
          </span>
        </div>
      )}

      {!listing.isCandidate && (listing.isBroken || listing.totalCostCad > 50) && (
        <div className="absolute top-2 left-2 z-10">
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 shadow-sm">
            {listing.isBroken ? "Broken" : "Over $50"}
          </span>
        </div>
      )}

      <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <SourceBadge source={listing.source} />
          <ScoreBadge score={listing.interestScore} />
        </div>

        <TagList tags={listing.interestTags} />

        {listing.interestRationale && (
          <p className="line-clamp-2 text-xs text-muted italic">
            {listing.interestRationale}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            <p className="text-lg font-semibold text-foreground">
              ${listing.totalCostCad.toFixed(2)}
              <span className="ml-1 text-xs font-normal text-muted">CAD total</span>
            </p>
            {listing.shippingCost !== null && listing.shippingCost > 0 && (
              <p className="text-xs text-muted">
                ${listing.price.toFixed(2)} + ${listing.shippingCost.toFixed(2)} shipping
              </p>
            )}
          </div>
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-md border border-stone-200 px-2 py-1 text-xs text-muted transition-colors hover:border-stone-400 hover:text-foreground"
          >
            <ExternalLink size={12} />
            View
          </a>
        </div>
      </div>
    </button>
  );
}
