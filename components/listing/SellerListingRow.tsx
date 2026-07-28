import Link from "next/link";
import type { Condition, ListingStatus } from "@prisma/client";
import { StatusBadge } from "./StatusBadge";
import { formatPrice, formatCondition } from "@/lib/format";

export interface SellerRowData {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  condition: Condition;
  price: number;
  status: ListingStatus;
  videoThumb: string | null;
  photos: string[];
  matchCount: number;
  topScore: number | null;
}

export function SellerListingRow({ listing }: { listing: SellerRowData }) {
  const thumb = listing.videoThumb ?? listing.photos[0] ?? null;
  const title = [listing.year, listing.brand, listing.model]
    .filter(Boolean)
    .join(" ");

  const body = (
    <div className="flex items-center gap-4 rounded-card border-[0.5px] border-hairline bg-white p-3 transition-colors hover:border-ink">
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-white">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={title} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-[16px] text-ink">{title}</p>
        <p className="text-[12px] text-muted">
          {formatCondition(listing.condition)} · {formatPrice(listing.price)}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-[13px] text-ink">{listing.matchCount} matches</p>
        {listing.topScore != null && (
          <p className="text-[12px] text-muted">top {listing.topScore}%</p>
        )}
      </div>
      <StatusBadge status={listing.status} />
    </div>
  );

  if (listing.status === "ACTIVE") {
    return <Link href={`/listing/${listing.id}`}>{body}</Link>;
  }
  return body;
}
