"use client";

import Image from "next/image";
import { useState } from "react";

interface ListingImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

export function ListingImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-card-border/40 text-muted ${className ?? ""}`}
      role="img"
      aria-label="No image available"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted/80">
        No photo
      </span>
    </div>
  );
}

export function ListingImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes = "(max-width: 640px) 100vw, 25vw",
  priority,
}: ListingImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src?.trim()) {
    const placeholderClass = fill
      ? `absolute inset-0 h-full w-full ${className ?? ""}`
      : className;
    return <ListingImagePlaceholder className={placeholderClass} />;
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        unoptimized
        suppressHydrationWarning
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 64}
      height={height ?? 64}
      className={className}
      priority={priority}
      unoptimized
      suppressHydrationWarning
      onError={() => setFailed(true)}
    />
  );
}
