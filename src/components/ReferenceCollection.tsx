import { ExternalLink } from "lucide-react";
import { ListingImage } from "@/components/ui";
import { TASTE_PROFILE } from "@/lib/taste-profile";

export function ReferenceCollection() {
  return (
    <div className="mb-6 rounded-2xl border border-card-border bg-card/45 p-5 shadow-[var(--shadow-border)]">
      <div className="mb-4">
        <h2 className="font-sans text-sm font-semibold tracking-tight text-foreground">
          Taste Profile Showcase
        </h2>
        <p className="mt-0.5 text-xs text-muted text-pretty">
          AI scoring is calibrated against these reference buys — vintage promotional models, mechanicals, and rare collaborations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TASTE_PROFILE.map((ref) => (
          <a
            key={ref.listing.url}
            href={ref.listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 rounded-xl bg-background/50 p-2 border border-card-border/60 transition-[box-shadow,background-color,border-color,transform] duration-200 ease-out hover:bg-card hover:border-card-border active:scale-[0.96] shadow-sm hover:shadow-md"
          >
            {/* Watch Thumbnail Frame with subtle theme-aware outline overlay */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-card-border bg-card transition-colors duration-200">
              <ListingImage
                src={ref.listing.images[0]}
                alt={ref.shortTitle}
                fill
                sizes="48px"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
              />
              <div className="premium-image-outline" />
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold tracking-tight text-foreground transition-colors group-hover:text-foreground/90">
                {ref.shortTitle}
              </p>
              <p className="truncate text-[11px] text-muted font-normal mt-0.5">
                {ref.note}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[11px] font-bold tabular-nums text-foreground">
                  {ref.totalPriceCad}
                </span>
                <span className="text-[9px] text-muted uppercase font-mono">CAD</span>
                <ExternalLink
                  size={10}
                  className="text-muted opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 ml-auto"
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
