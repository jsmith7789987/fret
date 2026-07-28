import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { configuredServices } from "@/lib/config";

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

  const configured = configuredServices();

  const body = {
    status: database === "ok" ? "ok" : "degraded",
    database,
    databaseError,
    configured,
    checkedInMs: Date.now() - startedAt,
  };

  return NextResponse.json(body, { status: database === "ok" ? 200 : 503 });
}
