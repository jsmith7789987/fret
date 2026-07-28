import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { HEADER_CATEGORIES } from "@/lib/categories";
import { isAuthConfigured } from "@/lib/auth";
import { MobileMenu } from "./MobileMenu";

/**
 * Two tier site header.
 *
 * Row one is identity and account. Row two is the category rail, which is the
 * primary way into inventory. The rail scrolls horizontally on narrow screens
 * rather than collapsing, so the categories stay visible on a phone.
 */
export function SiteHeader({
  showCategories = true,
}: {
  showCategories?: boolean;
}) {
  const authReady = isAuthConfigured();

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Row one */}
      <div className="border-b-[0.5px] border-hairline">
        <div className="mx-auto flex h-16 max-w-shell items-center gap-4 px-5 lg:px-8">
          <MobileMenu />

          <Link
            href="/"
            aria-label="fret. home"
            className="font-serif text-[26px] leading-none tracking-tight text-ink"
          >
            fret<span className="text-action">.</span>
          </Link>

          <div className="ml-auto flex items-center gap-6 text-[14px]">
            <Link
              href="/sell"
              className="hidden text-ink transition-colors hover:text-action sm:block"
            >
              Sell a guitar
            </Link>
            <Link
              href="/dealer/dashboard"
              className="hidden text-ink transition-colors hover:text-action md:block"
            >
              For dealers
            </Link>

            {authReady ? (
              <>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-2 rounded-full border border-action px-4 py-2 text-[14px] font-medium text-action transition-colors hover:bg-action hover:text-white"
                  >
                    <UserIcon />
                    Log in or sign up
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/onboarding"
                    className="hidden text-ink transition-colors hover:text-action sm:block"
                  >
                    My profile
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            ) : (
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-full border border-action px-4 py-2 text-[14px] font-medium text-action transition-colors hover:bg-action hover:text-white"
              >
                <UserIcon />
                Build my profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Row two, the category rail */}
      {showCategories && (
        <div className="border-b-[0.5px] border-hairline">
          <nav
            aria-label="Guitar categories"
            className="mx-auto max-w-shell overflow-x-auto px-5 lg:px-8"
          >
            <ul className="flex h-12 items-center gap-7 whitespace-nowrap text-[14px]">
              {HEADER_CATEGORIES.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className="text-ink transition-colors hover:text-action"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

function UserIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
