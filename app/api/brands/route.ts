import { ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { MAJOR_BRANDS, BOUTIQUE_BRANDS } from "@/lib/guitars";

// Reads the DB, so it must not be baked into the build output.
export const dynamic = "force-dynamic";

/** The brand catalog, including community brands that reached the threshold. */
export async function GET() {
  let promoted: string[] = [];
  try {
    const rows = await prisma.brandSuggestion.findMany({
      where: { promoted: true },
      orderBy: { displayName: "asc" },
    });
    promoted = rows.map((r) => r.displayName);
  } catch (err) {
    // DB unavailable. still serve the static catalog.
    console.error("[brands] Could not load promoted brands:", err);
  }

  return ok({
    major: MAJOR_BRANDS,
    boutique: BOUTIQUE_BRANDS,
    promoted,
  });
}
