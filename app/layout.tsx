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
  title: "fret. the boutique guitar marketplace",
  description:
    "A curated marketplace for boutique, high-end, and vintage guitars. Matched to you, priced to sell.",
};

// Clerk needs a publishable key to render. Publishable keys are public, not
// secrets. Fall back to a non-functional placeholder so a deployment without
// credentials still builds and serves the public pages. The health check
// reports whether real credentials are present.
const PLACEHOLDER_PUBLISHABLE_KEY =
  "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    PLACEHOLDER_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
        <body className="min-h-screen bg-white font-sans text-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
