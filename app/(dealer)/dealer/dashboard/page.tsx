import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ButtonLink } from "@/components/ui/Button";
import {
  SellerListingRow,
  type SellerRowData,
} from "@/components/listing/SellerListingRow";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DealerDashboardPage() {
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

  const active = rows.filter((r) => r.status === "ACTIVE");
  const inventoryValue = active.reduce((sum, r) => sum + r.price, 0);
  const totalMatches = rows.reduce((sum, r) => sum + r.matchCount, 0);

  const isDealer = user.role === "DEALER";

  return (
    <div className="min-h-screen bg-canvas">
      <Nav />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[28px] leading-tight text-ink">
              Dealer dashboard
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              Your full inventory at a glance.
            </p>
          </div>
          <ButtonLink href="/sell">Add inventory</ButtonLink>
        </div>

        {!isDealer && (
          <div className="mb-6 rounded-card border border-amber-border bg-amber-bg px-4 py-3 text-[13px] text-amber-text">
            This is the dealer view. Your account isn&apos;t flagged as a dealer
            yet — contact us to enable flat $25 listing pricing across your
            inventory.
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Stat label="Active listings" value={String(active.length)} />
          <Stat label="Inventory value" value={formatPrice(inventoryValue)} />
          <Stat label="Buyer matches" value={String(totalMatches)} />
        </div>

        {rows.length === 0 ? (
          <div className="rounded-card border-[0.5px] border-hairline bg-white px-6 py-16 text-center">
            <p className="text-[14px] text-muted">No inventory yet.</p>
            <ButtonLink href="/sell" className="mt-4">
              Add your first listing
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border-[0.5px] border-hairline bg-white p-4">
      <p className="text-[12px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-serif text-[24px] text-ink">{value}</p>
    </div>
  );
}
