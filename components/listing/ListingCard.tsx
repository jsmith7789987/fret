import Link from "next/link";
import type { Condition } from "@prisma/client";
import { MatchBadge } from "../ui/MatchBadge";
import {
  formatPrice,
  formatCondition,
  formatLocation,
  guitarTitle,
} from "@/lib/format";

export interface ListingCardData {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  finish: string | null;
  condition: Condition;
  price: number;
  city: string | null;
  state: string | null;
  videoId: string | null;
  videoThumb: string | null;
  photos: string[];
  score?: number | null;
}

function VideoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[20px] bg-ink/85 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      video
    </span>
  );
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const thumb = listing.videoThumb ?? listing.photos[0] ?? null;
  const title = guitarTitle(listing);
  const sub = [
    listing.finish,
    formatCondition(listing.condition),
    formatLocation(listing.city, listing.state),
  ]
    .filter(Boolean)
    .join(" · ");
  const hasVideo = Boolean(listing.videoId);
  const showMatch = typeof listing.score === "number" && listing.score >= 70;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-card border-[0.5px] border-hairline bg-white transition-colors hover:border-ink"
    >
      <div className="relative aspect-[4/3] w-full bg-white">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {showMatch && (
          <div className="absolute left-2 top-2">
            <MatchBadge score={listing.score!} />
          </div>
        )}
        {hasVideo && (
          <div className="absolute right-2 top-2">
            <VideoBadge />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-serif text-[15px] leading-tight text-ink">
          {title}
        </h3>
        {sub && <p className="mt-1 text-[12px] text-muted">{sub}</p>}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[14px] font-medium text-ink">
            {formatPrice(listing.price)}
          </span>
          <svg
            className="text-muted transition-colors group-hover:text-action"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
