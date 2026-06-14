"use client";

import type { ReactNode } from "react";

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
      className={`whitespace-nowrap rounded-[20px] border px-3 py-1 text-[13px] transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-hairline bg-white text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
