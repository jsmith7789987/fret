"use client";

import { useState } from "react";
import Link from "next/link";
import { HEADER_CATEGORIES } from "@/lib/categories";

/**
 * The hamburger in the top left. Opens a full height panel with the same
 * destinations as the header, for narrow screens and for people who prefer
 * a single list.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-ink transition-colors hover:text-action"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />

          <div className="relative flex h-full w-[300px] flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b-[0.5px] border-hairline px-5">
              <span className="font-serif text-[24px] leading-none text-ink">
                fret<span className="text-action">.</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-[20px] leading-none text-muted hover:text-ink"
              >
                &times;
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-5">
              <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-muted">
                Browse
              </p>
              <ul className="space-y-1">
                {HEADER_CATEGORIES.map((c) => (
                  <li key={c.label}>
                    <Link
                      href={c.href}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-[15px] text-ink hover:text-action"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mb-3 mt-7 text-[11px] uppercase tracking-[0.12em] text-muted">
                Your account
              </p>
              <ul className="space-y-1">
                {[
                  { label: "Build my profile", href: "/onboarding" },
                  { label: "Sell a guitar", href: "/sell" },
                  { label: "My listings", href: "/dashboard" },
                  { label: "For dealers", href: "/dealer/dashboard" },
                ].map((c) => (
                  <li key={c.label}>
                    <Link
                      href={c.href}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-[15px] text-ink hover:text-action"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
