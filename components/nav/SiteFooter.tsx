import Link from "next/link";
import { HEADER_CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-[0.5px] border-hairline bg-white">
      <div className="mx-auto max-w-shell px-5 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-serif text-[24px] leading-none text-ink">
              fret<span className="text-action">.</span>
            </span>
            <p className="mt-3 max-w-[240px] text-[13px] leading-relaxed text-muted">
              A curated marketplace for boutique, high end, and vintage guitars.
            </p>
          </div>

          <FooterColumn title="Browse" links={HEADER_CATEGORIES.slice(0, 6)} />
          <FooterColumn
            title="Sell"
            links={[
              { label: "List a guitar", href: "/sell" },
              { label: "My listings", href: "/dashboard" },
              { label: "For dealers", href: "/dealer/dashboard" },
            ]}
          />
          <FooterColumn
            title="Your account"
            links={[
              { label: "Build my profile", href: "/onboarding" },
              { label: "Sign in", href: "/sign-in" },
            ]}
          />
        </div>

        <p className="mt-12 border-t-[0.5px] border-hairline pt-6 text-[12px] text-muted">
          &copy; {year} fret. Prices shown are asking prices set by sellers.
          Fair market figures are estimates, not appraisals.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-muted">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[13px] text-ink transition-colors hover:text-action"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
