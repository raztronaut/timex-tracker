import type { ReactNode } from "react";

const VARIANTS = {
  default: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  subtle: "bg-zinc-500/5 text-zinc-500 dark:text-zinc-400 border-zinc-500/10",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  rose: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  green: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
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
