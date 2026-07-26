import Link from "next/link";
import { Logo } from "./ui/Logo";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 h-[52px] border-b-[0.5px] border-hairline bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
        <Logo href="/" />
        <nav className="flex items-center gap-5 text-[13px] text-muted">
          <Link href="/browse" className="hover:text-ink">
            Browse
          </Link>
          <Link href="/sell" className="hover:text-ink">
            Sell a guitar
          </Link>
          <Link href="/dealer/dashboard" className="hover:text-ink">
            Dealers
          </Link>
          <Link
            href="/onboarding"
            className="rounded-md border border-hairline px-3 py-1.5 text-ink hover:border-ink"
          >
            My profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
