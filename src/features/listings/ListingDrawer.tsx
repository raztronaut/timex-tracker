"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, ExternalLink } from "lucide-react";
import { ScoreBadge, TagList, SourceBadge, ListingImage } from "@/components/ui";
import type { Listing } from "@/lib/types";

interface ListingDrawerProps {
  listing: Listing | null;
  onClose: () => void;
}

export function ListingDrawer({ listing, onClose }: ListingDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!listing) return;

    triggerRef.current = document.activeElement;
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      trapFocus(e);
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [listing, onClose, trapFocus]);

  if (!listing) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-45 bg-black/40 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
        aria-hidden="true"
        onClick={onClose}
      />
      
      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card/95 border-l border-card-border shadow-2xl outline-none animate-[slide-in-right_250ms_ease-out] glass-panel"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-card-border bg-card/85 backdrop-blur px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Listing Details
          </span>
          <div className="flex items-center gap-2.5">
            <SourceBadge source={listing.source} />
            <button
              onClick={onClose}
              aria-label="Close detail panel"
              className="relative rounded-full p-1.5 text-muted hover:text-foreground hover:bg-card-border/50 transition-[color,background-color] duration-150 active:scale-[0.96] cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="drawer-stagger space-y-5 p-5">
          {/* Main Watch Photo with outline overlay */}
          {listing.images.length > 0 && (
            <div className="relative h-80 overflow-hidden rounded-xl bg-background border border-card-border">
              <ListingImage
                src={listing.images[0]}
                alt={listing.title}
                fill
                sizes="448px"
                className="object-contain"
              />
              <div className="premium-image-outline" />
            </div>
          )}

          {/* Sibling watch images grid with outline overlay */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
              {listing.images.slice(1, 6).map((img, i) => (
                <div key={img} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background border border-card-border">
                  <ListingImage
                    src={img}
                    alt={`${listing.title} photo ${i + 2}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <div className="premium-image-outline" />
                </div>
              ))}
            </div>
          )}

          {/* Heading, Pricing & Action Button */}
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <h2
                id="drawer-title"
                className="font-sans text-base font-bold leading-snug text-foreground text-balance"
              >
                {listing.title}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tracking-tight tabular-nums text-foreground">
                  ${listing.totalCostCad.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-muted uppercase font-mono">CAD Total</span>
              </div>

              {listing.shippingCost !== null && (
                <p className="text-[11px] tabular-nums text-muted">
                  Item: ${listing.price.toFixed(2)} &middot; Shipping: ${listing.shippingCost.toFixed(2)}
                </p>
              )}
              {listing.shippingCost === null && (
                <p className="text-[11px] text-muted italic">
                  + shipping TBD
                </p>
              )}
            </div>

            {/* Primary View Action Button */}
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 dark:text-zinc-950 py-2.5 px-4 text-xs font-bold tracking-tight transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] shadow-sm cursor-pointer"
            >
              <ExternalLink size={12} className="stroke-[2.5]" />
              Purchase via{" "}
              {listing.source === "ebay"
                ? "eBay"
                : listing.source === "etsy"
                  ? "Etsy"
                  : listing.source.toUpperCase()}
            </a>
          </div>

          {/* Unified AI Evaluation Card */}
          <div className="rounded-xl border border-card-border bg-card/35 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                AI Evaluation
              </span>
              <div className="flex gap-1.5">
                <ScoreBadge score={listing.interestScore} />
                {listing.isCandidate && (
                  <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                    Candidate
                  </span>
                )}
              </div>
            </div>

            {listing.interestRationale && (
              <p className="text-xs leading-relaxed text-foreground/90 font-serif italic">
                &ldquo;{listing.interestRationale}&rdquo;
              </p>
            )}

            {listing.interestTags.length > 0 && (
              <div className="pt-2 border-t border-card-border/40">
                <TagList tags={listing.interestTags} />
              </div>
            )}
          </div>

          {/* compact specifications Grid */}
          <div className="space-y-3 rounded-xl border border-card-border bg-card/15 p-4 shadow-sm">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted block mb-0.5">Condition</span>
                <span className="text-foreground font-medium">{listing.conditionRaw || "Undetermined"}</span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">Location</span>
                <span className="text-foreground font-medium">{listing.location || "Unknown"}</span>
              </div>

              {listing.listedAt && (
                <div className="col-span-2">
                  <span className="text-muted block mb-0.5">Published Date</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {new Date(listing.listedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dates footer */}
          <div className="border-t border-card-border pt-4 text-center text-[10px] text-muted space-y-1">
            <p className="tabular-nums">
              First discovered: {new Date(listing.firstSeenAt).toLocaleDateString("en-CA")}
            </p>
            <p className="tabular-nums">
              Last database sync: {new Date(listing.lastSeenAt).toLocaleDateString("en-CA")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
