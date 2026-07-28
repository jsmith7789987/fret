import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import {
  normalizeBrandName,
  prettyBrandName,
  findBrand,
  BRAND_PROMOTION_THRESHOLD,
} from "@/lib/guitars";

/**
 * Register a write-in ("Other") builder name. Each mention increments a count;
 * once BRAND_PROMOTION_THRESHOLD guitars of the same name are on the site, the
 * brand is promoted into the boutique picker for everyone.
 */
export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const user = auth.user;

  let name = "";
  try {
    const body = (await req.json()) as { name?: string };
    name = (body.name ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!name || name.length > 60) {
    return NextResponse.json({ error: "Invalid brand name" }, { status: 400 });
  }

  // Already a catalog brand. nothing to track.
  if (findBrand(name)) {
    return NextResponse.json({ promoted: true, count: null, known: true });
  }

  const slug = normalizeBrandName(name);
  if (!slug) {
    return NextResponse.json({ error: "Invalid brand name" }, { status: 400 });
  }

  const suggestion = await prisma.brandSuggestion.upsert({
    where: { slug },
    update: { count: { increment: 1 } },
    create: { slug, displayName: prettyBrandName(name), count: 1 },
  });

  // Promote once the threshold is reached.
  if (!suggestion.promoted && suggestion.count >= BRAND_PROMOTION_THRESHOLD) {
    const promotedRecord = await prisma.brandSuggestion.update({
      where: { id: suggestion.id },
      data: { promoted: true },
    });
    return NextResponse.json({
      promoted: true,
      count: promotedRecord.count,
      threshold: BRAND_PROMOTION_THRESHOLD,
    });
  }

  return NextResponse.json({
    promoted: suggestion.promoted,
    count: suggestion.count,
    threshold: BRAND_PROMOTION_THRESHOLD,
  });
}
