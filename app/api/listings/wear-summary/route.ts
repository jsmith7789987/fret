import { NextResponse } from "next/server";
import { summarizeWear } from "@/lib/anthropic";
import { getCurrentDbUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CONDITIONS = [
  "MINT",
  "EXCELLENT",
  "VERY_GOOD_PLUS",
  "VERY_GOOD",
  "GOOD",
  "FAIR",
];

/**
 * Summarize a seller's free-text wear-and-tear description.
 * The raw text is always stored alongside the summary — this never replaces it.
 */
export async function POST(req: Request) {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    brand?: string;
    model?: string;
    year?: number | null;
    condition?: string;
    wearAndTear?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const wearAndTear = (body.wearAndTear ?? "").trim();
  if (wearAndTear.length < 20) {
    return NextResponse.json(
      { error: "Describe the wear in a bit more detail first." },
      { status: 400 }
    );
  }
  if (wearAndTear.length > 5000) {
    return NextResponse.json(
      { error: "That description is too long to summarize." },
      { status: 400 }
    );
  }

  const condition =
    body.condition && CONDITIONS.includes(body.condition)
      ? body.condition
      : "UNSPECIFIED";

  try {
    const summary = await summarizeWear({
      brand: (body.brand ?? "").trim() || "Unspecified",
      model: (body.model ?? "").trim() || "Unspecified",
      year: typeof body.year === "number" ? body.year : null,
      condition,
      wearAndTear,
    });

    if (!summary) {
      return NextResponse.json(
        { error: "Could not summarize that. You can write your own." },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Wear summary failed:", err);
    return NextResponse.json(
      { error: "Summary service unavailable. You can write your own." },
      { status: 502 }
    );
  }
}
