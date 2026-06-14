import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/ui/Logo";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-canvas px-5">
      <Logo href="/welcome" />
      <SignUp
        appearance={{
          variables: { colorPrimary: "#111110" },
          elements: {
            card: "shadow-none border-[0.5px] border-hairline rounded-card",
          },
        }}
      />
    </div>
  );
}
