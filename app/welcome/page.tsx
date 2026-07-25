import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Nav */}
      <header className="h-[52px] border-b-[0.5px] border-hairline bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
          <Logo href="/welcome" />
          <div className="flex items-center gap-4 text-[13px] text-muted">
            <Link href="/sign-in" className="hover:text-ink">
              Sign in
            </Link>
            <ButtonLink href="/sign-up" variant="primary">
              Get started
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-16 pt-24 text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-[20px] border border-amber-border bg-amber-bg px-3 py-1 text-[12px] font-medium text-amber-text">
          <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          Curated. Video-first. Matched to you.
        </p>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          The guitar marketplace
          <br />
          that actually knows you.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
          fret. is a guitar-only marketplace with AI-powered matching. Tell us
          how you play and what you&apos;re chasing — we surface the instruments
          worth your attention, and text you the moment the right one lists.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          {/* Goes straight into the profile flow — middleware handles auth. */}
          <ButtonLink href="/onboarding" variant="primary" className="px-5 py-2.5">
            Build my profile
          </ButtonLink>
          <ButtonLink href="/sell" variant="secondary" className="px-5 py-2.5">
            Sell a guitar
          </ButtonLink>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-24 sm:grid-cols-3">
        {[
          {
            title: "Matched, not searched",
            body: "Every listing is scored against your profile. Your browse page is ranked for you, not alphabetized.",
          },
          {
            title: "Every guitar on video",
            body: "Sellers are required to upload a walkthrough video. No more guessing from three blurry photos.",
          },
          {
            title: "Alerts that matter",
            body: "When a guitar lists above your match threshold, you get a text — before anyone else scrolls past it.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-card border-[0.5px] border-hairline bg-white p-6"
          >
            <h3 className="font-serif text-[18px] text-ink">{card.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {card.body}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
