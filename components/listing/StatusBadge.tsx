import type { ListingStatus } from "@prisma/client";

const STYLES: Record<ListingStatus, { label: string; cls: string }> = {
  ACTIVE: {
    label: "Active",
    cls: "bg-amber-bg text-amber-text ring-amber-border",
  },
  PENDING_PAYMENT: {
    label: "Pending payment",
    cls: "bg-canvas text-muted ring-hairline",
  },
  SOLD: { label: "Sold", cls: "bg-ink text-white ring-ink" },
  EXPIRED: { label: "Expired", cls: "bg-canvas text-muted ring-hairline" },
  REMOVED: { label: "Removed", cls: "bg-canvas text-muted ring-hairline" },
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
