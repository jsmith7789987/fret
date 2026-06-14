import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-amber px-4 py-2",
  secondary:
    "bg-white text-ink border border-hairline hover:border-ink px-4 py-2",
  ghost: "text-muted hover:text-ink px-2 py-1",
};

interface ButtonOwnProps {
  variant?: Variant;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonOwnProps & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonOwnProps & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
