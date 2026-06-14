import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AlertBar } from "@/components/ui/AlertBar";
import { BrowseGrid } from "@/components/listing/BrowseGrid";
import type { ListingCardData } from "@/components/listing/ListingCard";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const profile = await prisma.buyerProfile.findUnique({
    where: { userId: user.id },
  });

  // No profile yet → send them through onboarding (the moat).
  if (!profile) redirect("/onboarding");

  // Match scores for this buyer.
  const scores = await prisma.matchScore.findMany({
    where: { buyerId: user.id },
  });
  const scoreByListing = new Map(scores.map((s) => [s.listingId, s.score]));

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  // Rank by match score; fall back to createdAt desc (already ordered) when
  // a listing has no score yet.
  const cards: ListingCardData[] = listings
    .map((l) => ({
      id: l.id,
      brand: l.brand,
      model: l.model,
      year: l.year,
      finish: l.finish,
      condition: l.condition,
      price: l.price,
      city: l.city,
      state: l.state,
      videoId: l.videoId,
      videoThumb: l.videoThumb,
      photos: l.photos,
      score: scoreByListing.get(l.id) ?? null,
    }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  // New high-match listings in the last 24h drive the alert bar.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newMatchCount = scores.filter(
    (s) => s.score >= 85 && s.createdAt >= since
  ).length;

  const lastUpdated = scores.reduce<Date | null>((acc, s) => {
    return !acc || s.updatedAt > acc ? s.updatedAt : acc;
  }, null);

  const topPref = profile.brands[0] ?? profile.genres[0] ?? "All guitars";

  return (
    <div className="min-h-screen bg-canvas">
      <Nav />

      <main className="mx-auto max-w-6xl px-5 py-8">
        {/* Hero */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-[28px] leading-tight text-ink">
              Matched for you
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {cards.length} {cards.length === 1 ? "guitar" : "guitars"} ranked
              against your profile
              {lastUpdated ? ` · updated ${relativeTime(lastUpdated)}` : ""}
            </p>
          </div>

          {/* Profile pill */}
          <Link
            href="/onboarding"
            className="flex items-center gap-2 rounded-[20px] border-[0.5px] border-hairline bg-white px-3 py-1.5 text-[12px] text-ink hover:border-ink"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            <span className="font-medium">{topPref}</span>
            {profile.maxSpend ? (
              <span className="text-muted">
                · up to {formatPrice(profile.maxSpend)}
              </span>
            ) : null}
          </Link>
        </div>

        {/* Alert bar */}
        <div className="mb-6">
          <AlertBar count={newMatchCount} />
        </div>

        {/* Filters + grid */}
        <BrowseGrid listings={cards} />
      </main>
    </div>
  );
}
