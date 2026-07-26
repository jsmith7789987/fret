import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ButtonLink } from "@/components/ui/Button";
import {
  SellerListingRow,
  type SellerRowData,
} from "@/components/listing/SellerListingRow";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const user = await getCurrentDbUser();

  // Degrade to an empty dashboard if the database is unreachable.
  const listings = await prisma.listing
    .findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { matchScores: true },
    })
    .catch((err) => {
      console.error("Dashboard data unavailable:", err);
      return [];
    });

  const rows: SellerRowData[] = listings.map((l) => ({
    id: l.id,
    brand: l.brand,
    model: l.model,
    year: l.year,
    condition: l.condition,
    price: l.price,
    status: l.status,
    videoThumb: l.videoThumb,
    photos: l.photos,
    matchCount: l.matchScores.filter((m) => m.score >= 70).length,
    topScore: l.matchScores.reduce<number | null>(
      (acc, m) => (acc == null || m.score > acc ? m.score : acc),
      null
    ),
  }));

  const active = rows.filter((r) => r.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-canvas">
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[28px] leading-tight text-ink">
              Your listings
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {active} active · {rows.length} total
            </p>
          </div>
          <ButtonLink href="/sell">List a guitar</ButtonLink>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-card border-[0.5px] border-hairline bg-white px-6 py-16 text-center">
            <p className="text-[14px] text-muted">
              You haven&apos;t listed anything yet.
            </p>
            <ButtonLink href="/sell" className="mt-4">
              List your first guitar
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <SellerListingRow key={r.id} listing={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
