"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { 
  ExternalLink, 
  MapPin, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  CircleDot
} from "lucide-react";
import { ScoreBadge, SourceBadge, TagList, ListingImage } from "@/components/ui";
import type { Listing } from "@/lib/types";

interface ShowcaseViewProps {
  listings: Listing[];
  loading: boolean;
  pending?: boolean;
  selected: Listing | null;
  onSelect: (listing: Listing) => void;
  onSync: () => void;
  syncing: boolean;
  filter: string;
  filterBar?: React.ReactNode;
}

// Helper to sanitize and shorten title for the vertical dial list
function getShortTitle(title: string) {
  const clean = title
    .replace(/vintage/gi, "")
    .replace(/watch/gi, "")
    .replace(/working/gi, "")
    .replace(/rare/gi, "")
    .replace(/mens/gi, "")
    .replace(/womens/gi, "")
    .replace(/original/gi, "")
    .replace(/timex/gi, "")
    .replace(/[\-–—_]/g, " ")
    .trim();
  
  if (!clean) return "Collector's Piece";
  
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 3) return words.join(" ");
  return words.slice(0, 3).join(" ") + "...";
}

export function ShowcaseView({
  listings,
  loading,
  pending,
  selected,
  onSelect,
  filter,
  filterBar,
}: Omit<ShowcaseViewProps, "total" | "onSync" | "syncing">) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const activeListing = selected || listings[0] || null;

  // Track previous listing to reset image index
  const [prevListingId, setPrevListingId] = useState<string | null>(null);
  if (activeListing && activeListing.id !== prevListingId) {
    setPrevListingId(activeListing.id);
    setActiveImgIndex(0);
    setIsSaved(false);
  }

  // Selected item index in the active list
  const selectedIndex = listings.findIndex((l) => l.id === (activeListing?.id ?? ""));

  const itemHeight = 44;
  const sideItemsCount = 2; // displays 5 items total: 2 above, 1 selected, 2 below

  const yMotion = useMotionValue((sideItemsCount - selectedIndex) * itemHeight);
  const ySpring = useSpring(yMotion, { stiffness: 120, damping: 24 });

  // Update spring target when active selection changes (e.g. keyboard arrows or list updates)
  useEffect(() => {
    yMotion.set((sideItemsCount - selectedIndex) * itemHeight);
  }, [selectedIndex, yMotion]);

  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle trackpad / mousewheel scrolling natively to allow non-passive preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      // Prevent parent/page scrolling while interacting with the wheel
      e.preventDefault();

      const currentY = yMotion.get();
      const newY = currentY - e.deltaY * 0.45; // 0.45 modifier for smooth scroll matching trackpad speed
      
      const minY = (sideItemsCount - (listings.length - 1)) * itemHeight;
      const maxY = sideItemsCount * itemHeight;
      
      // Allow minor elastic overshoot during continuous scrolling
      const clampedY = Math.max(minY - 30, Math.min(maxY + 30, newY));
      
      yMotion.set(clampedY);

      // Dynamic selection tracking during scroll
      const index = Math.round(sideItemsCount - clampedY / itemHeight);
      const clampedIndex = Math.max(0, Math.min(listings.length - 1, index));

      if (clampedIndex !== selectedIndex) {
        onSelect(listings[clampedIndex]);
      }

      // Debounce snapping layout to center of item
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      wheelTimeoutRef.current = setTimeout(() => {
        const snappedY = (sideItemsCount - clampedIndex) * itemHeight;
        yMotion.set(snappedY);
      }, 150);
    };

    container.addEventListener("wheel", onWheelNative, { passive: false });
    
    return () => {
      container.removeEventListener("wheel", onWheelNative);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [listings, selectedIndex, yMotion, onSelect, itemHeight, sideItemsCount]);

  // Select next/prev image
  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeListing?.images?.length) return;
    setActiveImgIndex((prev) => 
      prev === 0 ? activeListing.images.length - 1 : prev - 1
    );
  }, [activeListing]);

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeListing?.images?.length) return;
    setActiveImgIndex((prev) => 
      prev === activeListing.images.length - 1 ? 0 : prev + 1
    );
  }, [activeListing]);

  // Keyboard navigation for listing selection and image browsing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeListing || listings.length === 0) return;
      const currentIndex = listings.findIndex((l) => l.id === activeListing.id);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % listings.length;
        onSelect(listings[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + listings.length) % listings.length;
        onSelect(listings[prevIndex]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeListing.images?.length > 1) {
          setActiveImgIndex((prev) => 
            prev === 0 ? activeListing.images.length - 1 : prev - 1
          );
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (activeListing.images?.length > 1) {
          setActiveImgIndex((prev) => 
            prev === activeListing.images.length - 1 ? 0 : prev + 1
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeListing, listings, onSelect]);

  if (loading && listings.length === 0) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-3xl border border-card-border bg-card/10 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="text-xs text-muted font-medium">Calibrating watch dial...</p>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-card-border bg-card/10 w-full">
        <CircleDot className="mb-4 text-muted animate-pulse" size={32} />
        <h3 className="text-sm font-semibold text-foreground">
          No listings active
        </h3>
        <p className="mt-1.5 max-w-xs text-xs text-muted">
          {filter === "candidates"
            ? "No candidates yet. Try modifying your filters."
            : "No listings synced yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Immersive filter bar integrated inside the showcase layout */}
      {filterBar && (
        <div className="flex justify-center w-full animate-[fade-in_300ms_ease-out]">
          {filterBar}
        </div>
      )}

      <div 
        className={`grid grid-cols-1 gap-8 lg:grid-cols-12 items-center transition-opacity duration-200 ${
          pending ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* COLUMN 1: APPLE-STYLE 3D CYLINDER DIAL SELECTOR (3 columns) */}
        <div className="lg:col-span-3 flex flex-col justify-center h-[460px] relative select-none pr-4">
          {/* Wheel Picker Container */}
          <div ref={containerRef} className="relative w-full h-[220px] bg-card/25 border border-card-border/60 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-center dial-mask">
            {/* iOS Selector Glass Window Overlay (centered vertically) */}
            <div className="absolute left-0 right-0 h-11 top-1/2 -translate-y-1/2 border-y border-card-border/50 bg-foreground/[0.02] dark:bg-white/[0.02] pointer-events-none" />

            {/* Scrollable drum using Framer Motion ySpring and Drag Physics */}
            <motion.div
              drag="y"
              dragConstraints={{
                top: (sideItemsCount - (listings.length - 1)) * itemHeight,
                bottom: sideItemsCount * itemHeight,
              }}
              dragElastic={0.25}
              style={{ y: ySpring }}
              onDragEnd={() => {
                const currentY = ySpring.get();
                const index = Math.round(sideItemsCount - currentY / itemHeight);
                const clampedIndex = Math.max(0, Math.min(listings.length - 1, index));
                
                yMotion.set((sideItemsCount - clampedIndex) * itemHeight);
                onSelect(listings[clampedIndex]);
              }}
              className="absolute left-0 right-0 flex flex-col cursor-grab active:cursor-grabbing select-none"
            >
              {listings.map((item, idx) => {
                const isSelected = activeListing.id === item.id;
                const diff = idx - selectedIndex;
                const isOutOfView = Math.abs(diff) > 2;

                // Cylindrical cylinder drum projection style
                const transformStyle = {
                  transform: `perspective(800px) rotateX(${diff * -20}deg) translateZ(${-Math.abs(diff) * 20}px) scale(${1 - Math.abs(diff) * 0.08})`,
                  opacity: isOutOfView ? 0 : isSelected ? 1 : 0.7,
                  height: `${itemHeight}px`,
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    style={transformStyle}
                    className="dial-item-transition w-full flex items-center justify-center border-0 bg-transparent outline-none px-4 text-center cursor-pointer select-none"
                  >
                    <span className={`truncate uppercase tracking-widest font-sans transition-colors duration-200 ${
                      isSelected
                        ? "text-accent font-extrabold text-xs"
                        : "text-foreground/60 hover:text-foreground font-medium text-[10px]"
                    }`}>
                      {getShortTitle(item.title)}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* COLUMN 2: PREMIUM MINIMAL SHOWCASE CARD (5 columns) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          {/* Main Showcase Image Card with custom curvature and premium layered shadow */}
          <div className="relative aspect-square w-full max-w-[380px] rounded-3xl bg-card border border-card-border p-5 flex items-center justify-center shadow-[var(--shadow-border)] transition-colors duration-300">
            
            {/* 1px outline for photo depth (Rule 11) */}
            <div className="premium-image-outline" />

            {/* Candidates Banner overlay (top-left) */}
            {activeListing.isCandidate && (
              <div className="absolute top-5 left-5 z-10">
                <span className="rounded-full bg-accent-light border border-accent/20 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-accent">
                  Candidate
                </span>
              </div>
            )}

            {/* Source badge overlay (top-right) */}
            <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
              <SourceBadge source={activeListing.source} />
            </div>

            {/* Central Product Image Container with structured background framing box */}
            <div className="relative w-full h-full flex items-center justify-center">
              {activeListing.images?.length > 0 ? (
                <div className="w-full h-full relative flex items-center justify-center rounded-2xl bg-[#f0f0f2] dark:bg-[#111113] border border-card-border/40 p-5 overflow-hidden transition-colors duration-300">
                  <ListingImage
                    src={activeListing.images[activeImgIndex]}
                    alt={activeListing.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-center text-muted font-sans text-[10px] uppercase tracking-widest">
                  Photo Unavailable
                </div>
              )}
            </div>

            {/* Carousel Navigation Arrows inside the card */}
            {activeListing.images?.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 flex items-center justify-center bg-card/75 border border-card-border/80 text-foreground/80 hover:text-foreground shadow-md backdrop-blur-sm transition-all duration-150 hover:scale-[1.05] active:scale-[0.94] cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 flex items-center justify-center bg-card/75 border border-card-border/80 text-foreground/80 hover:text-foreground shadow-md backdrop-blur-sm transition-all duration-150 hover:scale-[1.05] active:scale-[0.94] cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </>
            )}

            {/* Pagination indicator dots inside card */}
            {activeListing.images?.length > 1 && (
              <div className="absolute bottom-5 flex gap-1">
                {activeListing.images.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex(i);
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeImgIndex 
                        ? "w-3 bg-accent" 
                        : "w-1.5 bg-muted/20 hover:bg-muted/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Minimal Floating Action Dock below the card (Rule 12 tactile scale) */}
          <div className="mt-5 flex items-center gap-3.5 bg-card/85 border border-card-border rounded-full px-5 py-2 shadow-[var(--shadow-border)] backdrop-blur transition-colors duration-300">
            <a
              href={activeListing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-card-border/40 text-foreground/80 hover:text-foreground transition-all hover:scale-[1.05] active:scale-[0.96] cursor-pointer"
              title="Visit Listing"
            >
              <ExternalLink size={14} />
            </a>

            <span className="h-4 w-px bg-card-border/50" />

            <button
              onClick={() => setIsSaved((s) => !s)}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-card-border/40 text-foreground/80 hover:text-foreground transition-all hover:scale-[1.05] active:scale-[0.96] cursor-pointer"
              title={isSaved ? "Saved" : "Save Favorite"}
            >
              <Heart size={14} className={isSaved ? "fill-red-500 stroke-red-500" : ""} />
            </button>
            
            <span className="h-4 w-px bg-card-border/50" />
            
            <div className="h-8 px-3 flex items-center justify-center text-[10px] font-bold tracking-wider text-foreground font-sans uppercase bg-card-border/30 rounded-full">
              ${activeListing.totalCostCad.toFixed(0)} CAD
            </div>
          </div>
        </div>

        {/* COLUMN 3: MINIMAL SPECIFICATION TABLE & EVALUATION (4 columns) */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-[var(--shadow-border)] flex flex-col justify-between min-h-[460px] transition-colors duration-300">
            <div className="space-y-4">
              
              {/* Header Title */}
              <div>
                <h2 className="text-xs font-extrabold leading-normal text-foreground uppercase tracking-widest font-sans">
                  {activeListing.title}
                </h2>
              </div>

              {/* Grid of properties with subtle separations */}
              <div className="border-t border-card-border/60 pt-3">
                <table className="w-full border-collapse text-[11px] font-sans">
                  <tbody>
                    <tr className="stagger-spec-row border-b border-card-border/45 py-2">
                      <td className="py-1.5 text-muted uppercase tracking-wider font-medium">Source</td>
                      <td className="py-1.5 text-right font-bold text-foreground capitalize">
                        {activeListing.source}
                      </td>
                    </tr>
                    
                    <tr className="stagger-spec-row border-b border-card-border/45 py-2">
                      <td className="py-1.5 text-muted uppercase tracking-wider font-medium">Listed</td>
                      <td className="py-1.5 text-right font-bold text-foreground">
                        ${activeListing.price.toFixed(2)} {activeListing.currency}
                      </td>
                    </tr>

                    <tr className="stagger-spec-row border-b border-card-border/45 py-2">
                      <td className="py-1.5 text-muted uppercase tracking-wider font-medium">Shipping</td>
                      <td className="py-1.5 text-right font-bold text-foreground">
                        {activeListing.shippingCost !== null 
                          ? `$${activeListing.shippingCost.toFixed(2)} ${activeListing.currency}`
                          : <span className="italic text-muted font-normal">TBD</span>}
                      </td>
                    </tr>

                    <tr className="stagger-spec-row border-b border-card-border/45 py-2">
                      <td className="py-1.5 text-muted uppercase tracking-wider font-medium">Condition</td>
                      <td className="py-1.5 text-right font-bold text-foreground">
                        <span className={activeListing.isBroken ? "text-red-500 font-bold" : ""}>
                          {activeListing.conditionRaw || "Undetermined"}
                        </span>
                      </td>
                    </tr>

                    <tr className="stagger-spec-row border-b border-card-border/45 py-2">
                      <td className="py-1.5 text-muted uppercase tracking-wider font-medium">Location</td>
                      <td className="py-1.5 text-right font-bold text-foreground flex items-center justify-end gap-1">
                        <MapPin size={10} className="text-muted" />
                        {activeListing.location || "Unknown"}
                      </td>
                    </tr>

                    <tr className="stagger-spec-row py-2">
                      <td className="py-1.5 text-muted uppercase tracking-wider font-medium">Synced</td>
                      <td className="py-1.5 text-right font-bold text-foreground flex items-center justify-end gap-1">
                        <Clock size={10} className="text-muted" />
                        {activeListing.listedAt ? (
                          <span>
                            {new Date(activeListing.listedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        ) : (
                          <span className="italic text-muted font-normal">Unknown</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Highlighted AI evaluation callout box */}
              {activeListing.interestRationale && (
                <div className="border-t border-card-border/60 pt-3">
                  <div className="border border-accent/15 bg-accent-light/30 rounded-2xl p-3.5 shadow-sm space-y-2 mt-2">
                    <div className="flex items-center gap-1 text-[8px] font-bold text-accent uppercase tracking-widest">
                      <Sparkles size={10} />
                      <span>AI Evaluation</span>
                      <span className="ml-auto">
                        <ScoreBadge score={activeListing.interestScore} />
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground/95 italic font-serif">
                      &ldquo;{activeListing.interestRationale}&rdquo;
                    </p>
                    
                    {activeListing.interestTags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <TagList tags={activeListing.interestTags} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Seen timestamps footer */}
            <div className="border-t border-card-border/60 pt-2 text-center text-[9px] text-muted flex justify-between font-sans">
              <span>First Seen: {new Date(activeListing.firstSeenAt).toLocaleDateString()}</span>
              <span>Total: ${activeListing.totalCostCad.toFixed(2)} CAD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
