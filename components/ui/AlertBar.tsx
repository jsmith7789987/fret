import Link from "next/link";

export function AlertBar({
  count,
  href = "#new",
}: {
  count: number;
  href?: string;
}) {
  if (count < 1) return null;
  const label =
    count === 1
      ? "1 new guitar matched your profile in the last 24 hours"
      : `${count} new guitars matched your profile in the last 24 hours`;

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-card border border-match-border bg-match-bg px-4 py-3 text-match-text transition-colors hover:border-match"
    >
      <span className="flex items-center gap-2 text-[13px] font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-match" />
        {label}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  );
}
