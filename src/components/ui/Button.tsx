import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary:
    "bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-900",
  secondary:
    "bg-white text-stone-700 shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) focus-visible:ring-stone-400",
  ghost:
    "text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus-visible:ring-stone-400",
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
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
