import type { ReactNode } from "react";

const VARIANTS = {
  default: "bg-stone-900/60 text-stone-300 border-stone-800",
  subtle: "bg-stone-950/40 text-stone-400 border-stone-900/50",
  success: "bg-emerald-950/40 text-emerald-300 border-emerald-900/30",
  warning: "bg-amber-950/40 text-amber-300 border-amber-900/30",
  danger: "bg-red-950/40 text-red-400 border-red-900/30",
  info: "bg-blue-950/40 text-blue-300 border-blue-900/30",
  purple: "bg-purple-950/40 text-purple-300 border-purple-900/30",
  orange: "bg-orange-950/40 text-orange-300 border-orange-900/30",
  cyan: "bg-cyan-950/40 text-cyan-300 border-cyan-900/30",
  rose: "bg-rose-950/40 text-rose-300 border-rose-900/30",
  green: "bg-green-950/40 text-green-300 border-green-900/30",
} as const;

type BadgeVariant = keyof typeof VARIANTS;

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
