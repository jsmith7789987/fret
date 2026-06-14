import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border-[0.5px] border-hairline bg-white ${className}`}
    >
      {children}
    </div>
  );
}
