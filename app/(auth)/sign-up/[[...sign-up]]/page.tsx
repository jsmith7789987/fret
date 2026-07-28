import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <AuthShell configured={isAuthConfigured()}>
      <SignUp
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
