import type { ListingStatus } from "@prisma/client";

const STYLES: Record<ListingStatus, { label: string; cls: string }> = {
  ACTIVE: {
    label: "Active",
    cls: "bg-match-bg text-match-text ring-match-border",
  },
  PENDING_PAYMENT: {
    label: "Pending payment",
    cls: "bg-white text-muted ring-hairline",
  },
  SOLD: { label: "Sold", cls: "bg-ink text-white ring-ink" },
  EXPIRED: { label: "Expired", cls: "bg-white text-muted ring-hairline" },
  REMOVED: { label: "Removed", cls: "bg-white text-muted ring-hairline" },
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-[20px] px-2 py-0.5 text-[11px] font-medium ring-1 ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
