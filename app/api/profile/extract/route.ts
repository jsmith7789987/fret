import { NextResponse } from "next/server";
import { extractProfile } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let onboardingText = "";
  try {
    const body = (await req.json()) as { onboardingText?: string };
    onboardingText = (body.onboardingText ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!onboardingText) {
    return NextResponse.json(
      { error: "onboardingText is required" },
      { status: 400 }
    );
  }

  let extracted;
  try {
    extracted = await extractProfile(onboardingText);
  } catch (err) {
    console.error("Profile extraction failed:", err);
    return NextResponse.json(
      { error: "Extraction failed" },
      { status: 502 }
    );
  }

  const profile = await prisma.buyerProfile.upsert({
    where: { userId: user.id },
    update: {
      onboardingText,
      genres: extracted.genres,
      brands: extracted.brands,
      currentGuitars: extracted.currentGuitars,
      dreamGuitar: extracted.dreamGuitar,
      maxSpend: extracted.maxSpend,
      sophistication: extracted.sophistication,
    },
    create: {
      userId: user.id,
      onboardingText,
      genres: extracted.genres,
      brands: extracted.brands,
      currentGuitars: extracted.currentGuitars,
      dreamGuitar: extracted.dreamGuitar,
      maxSpend: extracted.maxSpend,
      sophistication: extracted.sophistication,
    },
  });

  return NextResponse.json({ profile });
}
