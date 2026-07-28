import { SiteHeader } from "@/components/nav/SiteHeader";
import { SellFlow } from "@/components/sell/SellFlow";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SellPage() {
  // Any signed-in account may list. Ownership is enforced per listing.
  await requireUser("/sell");

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader showCategories={false} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-[28px] leading-tight text-ink">
            List a guitar
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Video, photos, details, then a one-time listing fee. Goes live the
            moment payment clears.
          </p>
        </div>
        <SellFlow />
      </main>
    </div>
  );
}
