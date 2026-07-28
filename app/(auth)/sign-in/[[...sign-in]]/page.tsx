import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <AuthShell configured={isAuthConfigured()}>
      <SignIn
        appearance={{
          variables: { colorPrimary: "#111110" },
          elements: {
            card: "shadow-none border-[0.5px] border-hairline rounded-card",
          },
        }}
      />
    </AuthShell>
  );
}
