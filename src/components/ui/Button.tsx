import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary:
    "bg-foreground text-background hover:opacity-90 focus-visible:ring-foreground",
  secondary:
    "bg-card text-foreground border border-card-border shadow-[var(--shadow-border)] hover:bg-card-border/50 focus-visible:ring-card-border",
  ghost:
    "text-muted hover:text-foreground hover:bg-card-border/50 focus-visible:ring-card-border",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "sm",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
