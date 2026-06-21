import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "fret. — the guitar marketplace",
  description:
    "A curated, video-first marketplace for serious guitars. Matched to you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clerk needs a publishable key at build time to prerender pages wrapped by
  // ClerkProvider. Publishable keys are public (not secrets), so we fall back
  // to a non-functional placeholder so the build/prerender never crashes when
  // the env var isn't injected at build time. Set the real
  // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (build-time scope) for a working app.
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
        <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
