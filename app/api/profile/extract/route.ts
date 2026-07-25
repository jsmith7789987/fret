import { NextResponse } from "next/server";
import { extractProfile, type ExtractedProfile } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";

interface GuitarPayload {
  brand?: string;
  model?: string | null;
  bodyShape?: string | null;
  topWood?: string | null;
  backSidesWood?: string | null;
  yearBuilt?: number | null;
  serialNumber?: string | null;
  description?: string | null;
}

interface StructuredPayload {
  brands?: string[];
  models?: string[];
  bodyShapes?: string[];
  topWoods?: string[];
  backSidesWoods?: string[];
  maxSpend?: number | null;
  owned?: GuitarPayload[];
  chasing?: GuitarPayload[];
}

function cleanGuitars(list: GuitarPayload[] | undefined) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((g) => (g.brand ?? "").trim() || (g.model ?? "").trim())
    .slice(0, 25)
    .map((g) => ({
      brand: (g.brand ?? "").trim() || "Unspecified",
      model: g.model?.trim() || null,
      bodyShape: g.bodyShape || null,
      topWood: g.topWood || null,
      backSidesWood: g.backSidesWood || null,
      yearBuilt:
        typeof g.yearBuilt === "number" && Number.isFinite(g.yearBuilt)
          ? g.yearBuilt
          : null,
      serialNumber: g.serialNumber?.trim() || null,
      description: g.description?.trim() || null,
    }));
}

function strings(list: unknown, limit = 60): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim())
    .slice(0, limit);
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let onboardingText = "";
  let structured: StructuredPayload = {};
  try {
    const body = (await req.json()) as {
      onboardingText?: string;
      structured?: StructuredPayload;
    };
    onboardingText = (body.onboardingText ?? "").trim();
    structured = body.structured ?? {};
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!onboardingText) {
    return NextResponse.json(
      { error: "onboardingText is required" },
      { status: 400 }
    );
  }

  // AI extraction is best-effort — the structured picks are the source of
  // truth, so a transient API failure shouldn't lose the buyer's whole session.
  let extracted: ExtractedProfile | null = null;
  try {
    extracted = await extractProfile(onboardingText);
  } catch (err) {
    console.error("Profile extraction failed, saving structured data only:", err);
  }

  const pickedBrands = strings(structured.brands);
  const owned = cleanGuitars(structured.owned);
  const chasing = cleanGuitars(structured.chasing);

  // Structured selections win over AI inference where both exist.
  const data = {
    onboardingText,
    genres: extracted?.genres ?? [],
    brands: pickedBrands.length ? pickedBrands : (extracted?.brands ?? []),
    models: strings(structured.models),
    bodyShapes: strings(structured.bodyShapes),
    topWoods: strings(structured.topWoods),
    backSidesWoods: strings(structured.backSidesWoods),
    currentGuitars: extracted?.currentGuitars ?? null,
    dreamGuitar: extracted?.dreamGuitar ?? null,
    maxSpend:
      typeof structured.maxSpend === "number" && structured.maxSpend > 0
        ? Math.round(structured.maxSpend)
        : (extracted?.maxSpend ?? null),
    sophistication: extracted?.sophistication ?? 1,
  };

  const profile = await prisma.buyerProfile.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  // Replace the guitar records for this profile.
  await prisma.profileGuitar.deleteMany({ where: { profileId: profile.id } });
  if (owned.length || chasing.length) {
    await prisma.profileGuitar.createMany({
      data: [
        ...owned.map((g) => ({
          ...g,
          profileId: profile.id,
          slot: "OWNED" as const,
        })),
        ...chasing.map((g) => ({
          ...g,
          profileId: profile.id,
          slot: "CHASING" as const,
        })),
      ],
    });
  }

  return NextResponse.json({
    profile,
    guitars: { owned: owned.length, chasing: chasing.length },
    aiExtracted: extracted !== null,
  });
}
