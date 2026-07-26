import { notFound, redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { VideoPlayer } from "@/components/listing/VideoPlayer";
import { ContactSeller } from "@/components/listing/ContactSeller";
import { MatchBadge } from "@/components/ui/MatchBadge";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatPrice,
  formatCondition,
  formatLocation,
  memberSince,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentDbUser();

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { seller: true },
  });

  if (!listing || listing.status === "REMOVED") notFound();

  const match = await prisma.matchScore.findUnique({
    where: {
      listingId_buyerId: { listingId: listing.id, buyerId: user.id },
    },
  });

  const title = [listing.year, listing.brand, listing.model]
    .filter(Boolean)
    .join(" ");
  const location = formatLocation(listing.city, listing.state);
  const galleryPhotos = listing.videoId ? listing.photos : listing.photos.slice(1);
  const heroPhoto = listing.photos[0] ?? null;

  const specs: [string, string][] = (
    [
      ["Brand", listing.brand],
      ["Model", listing.model],
      ["Year built", listing.year ? String(listing.year) : null],
      ["Body shape", listing.bodyShape],
      ["Top", listing.topWood],
      ["Back & sides", listing.backSidesWood],
      ["Neck", listing.neckWood],
      ["Fretboard", listing.fretboardWood],
      ["Bracing", listing.bracing],
      ["Nut width", listing.nutWidth],
      ["Scale length", listing.scaleLength],
      ["Finish", [listing.finish, listing.finishType].filter(Boolean).join(" · ")],
      ["Electronics", listing.electronics],
      ["Case", listing.caseType],
      ["Country of origin", listing.countryOfOrigin],
      ["Condition", formatCondition(listing.condition)],
      ["Serial number", listing.serialNumber],
    ] as [string, string | null][]
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="min-h-screen bg-canvas">
      <Nav />

      <main className="mx-auto max-w-4xl px-5 py-8">
        {/* Media */}
        {listing.videoId ? (
          <VideoPlayer videoId={listing.videoId} poster={listing.videoThumb} />
        ) : heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroPhoto}
            alt={title}
            className="aspect-video w-full rounded-card object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-card border-[0.5px] border-hairline bg-white text-muted">
            No media
          </div>
        )}

        {/* Header */}
        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {match && <MatchBadge score={match.score} />}
              <span className="inline-flex items-center rounded-[20px] border-[0.5px] border-hairline bg-white px-2 py-0.5 text-[11px] text-muted">
                {formatCondition(listing.condition)}
              </span>
              {location && (
                <span className="text-[12px] text-muted">{location}</span>
              )}
            </div>
            <h1 className="font-serif text-[34px] leading-tight text-ink">
              {title}
            </h1>
            {listing.finish && (
              <p className="mt-1 text-[14px] text-muted">{listing.finish}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-serif text-[28px] text-ink">
              {formatPrice(listing.price)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_280px]">
          {/* Left: description + photos */}
          <div>
            <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-muted">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
              {listing.description}
            </p>

            {/* Condition & wear */}
            {(listing.wearSummary || listing.wearAndTear) && (
              <div className="mt-8">
                <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-muted">
                  Condition &amp; wear
                </h2>
                {listing.wearSummary && (
                  <p className="rounded-card border border-amber-border bg-amber-bg px-4 py-3 text-[14px] leading-relaxed text-amber-text">
                    {listing.wearSummary}
                  </p>
                )}
                {listing.wearAndTear && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[12px] text-muted hover:text-ink">
                      Read the seller&apos;s full description
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                      {listing.wearAndTear}
                    </p>
                  </details>
                )}
              </div>
            )}

            {listing.modifications && (
              <div className="mt-8">
                <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-muted">
                  Modifications
                </h2>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                  {listing.modifications}
                </p>
              </div>
            )}

            {/* Specs */}
            {specs.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wide text-muted">
                  Specifications
                </h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {specs.map(([label, value]) => (
                    <div key={label} className="border-t-[0.5px] border-hairline pt-2">
                      <dt className="text-[11px] uppercase tracking-wide text-muted">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-[14px] text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {galleryPhotos.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {galleryPhotos.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={title}
                    className="aspect-[4/3] w-full rounded-card border-[0.5px] border-hairline object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: seller + contact */}
          <aside className="space-y-5">
            <div className="rounded-card border-[0.5px] border-hairline bg-white p-4">
              <p className="text-[12px] uppercase tracking-wide text-muted">
                Seller
              </p>
              <p className="mt-1 text-[15px] font-medium text-ink">
                {listing.seller.firstName ?? "Private seller"}
                {listing.seller.role === "DEALER" && (
                  <span className="ml-2 rounded-[20px] bg-amber-bg px-2 py-0.5 text-[11px] text-amber-text ring-1 ring-amber-border">
                    Dealer
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-[12px] text-muted">
                Member since {memberSince(listing.seller.createdAt)}
              </p>
            </div>

            <ContactSeller listingId={listing.id} />
          </aside>
        </div>
      </main>
    </div>
  );
}
