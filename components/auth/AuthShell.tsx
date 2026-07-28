import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/**
 * Frame for the sign-in and sign-up pages. When Clerk has no credentials on
 * this deployment it shows a plain notice instead of a widget that cannot work.
 */
export function AuthShell({
  configured,
  children,
}: {
  configured: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-5">
      <Logo href="/" />

      {configured ? (
        children
      ) : (
        <div className="max-w-sm rounded-card border-[0.5px] border-hairline bg-white p-6 text-center">
          <p className="text-[14px] font-medium text-ink">
            Sign in is not set up yet
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            This deployment has no authentication credentials configured. You
            can still browse the marketplace without an account.
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-flex items-center rounded-md bg-action px-4 py-2 text-[13px] font-medium text-white hover:bg-action-hover"
          >
            Browse guitars
          </Link>
        </div>
      )}

      <Link href="/browse" className="text-[13px] text-muted hover:text-action">
        Keep looking without an account
      </Link>
    </div>
  );
}
