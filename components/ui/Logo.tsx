import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="font-serif text-[22px] leading-none tracking-tight text-ink"
      aria-label="fret. home"
    >
      fret<span className="text-action">.</span>
    </Link>
  );
}
