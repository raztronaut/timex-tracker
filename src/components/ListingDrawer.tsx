"use client";

import { X, ExternalLink, Clock, MapPin, Tag } from "lucide-react";
import { ScoreBadge } from "./ScoreBadge";
import { TagList } from "./TagList";
import { SourceBadge } from "./SourceBadge";
import type { Listing } from "@/lib/types";

interface ListingDrawerProps {
  listing: Listing | null;
  onClose: () => void;
}

export function ListingDrawer({ listing, onClose }: ListingDrawerProps) {
  if (!listing) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2">
            <SourceBadge source={listing.source} />
            <ScoreBadge score={listing.interestScore} />
            {listing.isCandidate && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Candidate
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {listing.images.length > 0 && (
            <div className="overflow-hidden rounded-lg bg-stone-100">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full object-contain max-h-80"
              />
            </div>
          )}

          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.images.slice(1, 5).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover border border-stone-200 flex-shrink-0"
                />
              ))}
            </div>
          )}

          <h2 className="text-lg font-semibold leading-tight">{listing.title}</h2>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              ${listing.totalCostCad.toFixed(2)}
            </span>
            <span className="text-sm text-muted">CAD total</span>
          </div>

          {listing.shippingCost !== null && (
            <p className="text-sm text-muted">
              ${listing.price.toFixed(2)} item + ${listing.shippingCost.toFixed(2)} shipping
            </p>
          )}

          <div className="space-y-3 rounded-lg bg-stone-50 p-3">
            <div className="flex items-start gap-2">
              <Tag size={14} className="mt-0.5 text-muted" />
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wide">
                  Condition
                </p>
                <p className="text-sm">{listing.conditionRaw || "Unknown"}</p>
              </div>
            </div>

            {listing.location && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-muted" />
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm">{listing.location}</p>
                </div>
              </div>
            )}

            {listing.listedAt && (
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 text-muted" />
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide">
                    Listed
                  </p>
                  <p className="text-sm">
                    {new Date(listing.listedAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {listing.interestTags.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted uppercase tracking-wide">
                Tags
              </p>
              <TagList tags={listing.interestTags} />
            </div>
          )}

          {listing.interestRationale && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800 uppercase tracking-wide mb-1">
                AI Assessment
              </p>
              <p className="text-sm text-amber-900">{listing.interestRationale}</p>
            </div>
          )}

          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            <ExternalLink size={14} />
            View on {listing.source === "ebay" ? "eBay" : listing.source === "etsy" ? "Etsy" : listing.source}
          </a>

          <p className="text-center text-xs text-muted">
            First seen {new Date(listing.firstSeenAt).toLocaleDateString("en-CA")}
            {" · "}
            Last synced {new Date(listing.lastSeenAt).toLocaleDateString("en-CA")}
          </p>
        </div>
      </div>
    </>
  );
}
