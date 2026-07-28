import Link from "next/link";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/nav/SiteFooter";
import { CategoryTile } from "@/components/home/CategoryTile";
import { FEATURED_CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

/**
 * The front door.
 *
 * Section 3 of the brief requires a fork with two paths and nothing else
 * competing for attention, so the fork owns the hero and sits above the fold
 * on its own. Featured categories come after it, for the person who scrolls
 * rather than choosing.
 */
export default function HomePage() {
  // Per category counts arrive with Milestone 6 search. Until then a tile
  // shows no number rather than a made up one.

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* The fork */}
      <section className="border-b-[0.5px] border-hairline bg-sand">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-[44px] leading-[1.06] tracking-tight text-ink sm:text-[60px]">
              Boutique guitars,
              <br />
              priced to sell.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-muted">
              A curated marketplace for high end, vintage, and small shop
              instruments. Every listing carries a video and a fair market price
              check.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            <ForkCard
              href="/onboarding"
              eyebrow="Recommended"
              title="Tell us about yourself"
              body="Six questions about what you play and what you are chasing. We rank every guitar for you and text you when the right one lists."
              primary
            />
            <ForkCard
              href="/browse"
              eyebrow="No account needed"
              title="Just start searching"
              body="Go straight to everything for sale. You can build your profile later, any time."
            />
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="mx-auto max-w-shell px-5 py-16 lg:px-8 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="font-serif text-[34px] leading-tight tracking-tight text-ink sm:text-[40px]">
            Featured categories
          </h2>
          <Link
            href="/browse"
            className="hidden shrink-0 items-center gap-2 text-[14px] text-action hover:text-action-hover sm:inline-flex"
          >
            See everything
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_CATEGORIES.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {/* What makes this different */}
      <section className="border-t-[0.5px] border-hairline bg-sand">
        <div className="mx-auto max-w-shell px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                title: "Matched, not searched",
                body: "Every listing is scored against your profile. Your browse page is ranked for you, not sorted alphabetically.",
              },
              {
                title: "Priced to sell",
                body: "Every asking price is checked against a fair market range. Sellers who want a fair price belong here. Wishful pricing does not.",
              },
              {
                title: "Every guitar on video",
                body: "A walkthrough video is required to list, along with the serial number and a full account of the wear.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-serif text-[22px] leading-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ForkCard({
  href,
  eyebrow,
  title,
  body,
  primary = false,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-card border bg-white p-7 transition-colors ${
        primary
          ? "border-action hover:bg-action-soft"
          : "border-hairline hover:border-action"
      }`}
    >
      <span
        className={`text-[11px] uppercase tracking-[0.12em] ${
          primary ? "text-action" : "text-muted"
        }`}
      >
        {eyebrow}
      </span>
      <h2 className="mt-3 font-serif text-[26px] leading-tight text-ink">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted">
        {body}
      </p>
      <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-action">
        {primary ? "Build my profile" : "Browse guitars"}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </Link>
  );
}
