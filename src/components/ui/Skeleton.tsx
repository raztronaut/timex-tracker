interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-stone-200/60 ${className}`}
      aria-hidden="true"
    />
  );
}
