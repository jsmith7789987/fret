"use client";

import type { ReactNode } from "react";

/**
 * Filter pill. Chips are controls, so the active state uses the action colour
 * rather than near black.
 */
export function Chip({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
        active
          ? "border-action bg-action text-white"
          : "border-hairline bg-white text-ink hover:border-action hover:text-action"
      }`}
    >
      {children}
    </button>
  );
}
