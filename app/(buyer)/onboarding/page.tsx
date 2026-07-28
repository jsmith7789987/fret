import { ProfileForm } from "@/components/onboarding/ProfileForm";
import { Logo } from "@/components/ui/Logo";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  await requireUser("/onboarding");

  return (
    <div className="min-h-screen bg-white">
      <header className="h-[52px] border-b-[0.5px] border-hairline bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center px-5">
          <Logo href="/browse" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-[34px] leading-tight text-ink">
            Let&apos;s build your profile.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-muted">
            Six quick questions. Answer in your own words. type or talk. We use
            this to rank every guitar for you and text you when the right one
            lists.
          </p>
        </div>

        <ProfileForm />
      </main>
    </div>
  );
}
