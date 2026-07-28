"use client";

import { formatPrice } from "@/lib/format";
import { isPremiumPrice } from "@/lib/pricing";
import type { ListingDraft } from "../draft";

export function ReviewStep({
  details,
  guitarName,
  specRows,
  videoId,
  photos,
  priceNum,
  fee,
}: {
  details: ListingDraft;
  guitarName: string;
  specRows: [string, string][];
  videoId: string | null;
  photos: string[];
  priceNum: number;
  fee: number;
}) {
  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-[24px] text-ink">Review &amp; pay</h2>

      <div className="mt-6 rounded-card border-[0.5px] border-hairline bg-white p-5">
        <p className="font-serif text-[20px] text-ink">{guitarName}</p>
        <p className="mt-1 text-[13px] text-muted">
          Serial {details.serialNumber || " - "}
        </p>
        <p className="mt-3 text-[18px] font-medium text-ink">
          {formatPrice(priceNum || 0)}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t-[0.5px] border-hairline pt-4">
          {specRows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] uppercase tracking-wide text-muted">
                {label}
              </dt>
              <dd className="text-[13px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {details.wearSummary && (
          <div className="mt-4 border-t-[0.5px] border-hairline pt-4">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Wear summary
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink">
              {details.wearSummary}
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-4 border-t-[0.5px] border-hairline pt-4 text-[12px] text-muted">
          <span>{videoId ? "✓ Video" : "No video"}</span>
          <span>
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-card border-[0.5px] border-hairline bg-white px-5 py-4">
        <div>
          <p className="text-[14px] font-medium text-ink">Listing fee</p>
          <p className="text-[12px] text-muted">
            {isPremiumPrice(priceNum) ? "Premium" : "Standard"} tier, one-time
          </p>
        </div>
        <p className="font-serif text-[22px] text-ink">${fee}</p>
      </div>
    </div>
  );
}
