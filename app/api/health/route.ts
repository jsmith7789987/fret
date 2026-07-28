import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Health check for the deployment pipeline.
 * Reports whether the app is up, whether the database answers, and which
 * integrations have credentials. Returns 503 if the database is unreachable
 * so the platform can see a genuine failure.
 */
export async function GET() {
  const startedAt = Date.now();

  let database: "ok" | "unreachable" = "unreachable";
  let databaseError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch (err) {
    databaseError = err instanceof Error ? err.message : "unknown error";
  }

  const configured = {
    database: Boolean(process.env.DATABASE_URL),
    clerk: Boolean(
      process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    cloudflareStream: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_STREAM_API_TOKEN,
    ),
    cloudflareR2: Boolean(
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    ),
    twilio: Boolean(process.env.TWILIO_ACCOUNT_SID),
    resend: Boolean(process.env.RESEND_API_KEY),
    typesense: Boolean(process.env.TYPESENSE_HOST),
  };

  const body = {
    status: database === "ok" ? "ok" : "degraded",
    database,
    databaseError,
    configured,
    checkedInMs: Date.now() - startedAt,
  };

  return NextResponse.json(body, { status: database === "ok" ? 200 : 503 });
}
