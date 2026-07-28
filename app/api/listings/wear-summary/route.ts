import { badRequest, ok, upstreamFailure } from "@/lib/api";
import { summarizeWear } from "@/lib/anthropic";
import { isCondition } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Summarize a seller's free-text wear-and-tear description.
 * The raw text is always stored alongside the summary. this never replaces it.
 */
export async function POST(req: Request) {
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
    return badRequest("Invalid body");
  }

  const wearAndTear = (body.wearAndTear ?? "").trim();
  if (wearAndTear.length < 20) {
    return badRequest("Describe the wear in a bit more detail first.");
  }
  if (wearAndTear.length > 5000) {
    return badRequest("That description is too long to summarize.");
  }

  const condition = isCondition(body.condition)
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
      return upstreamFailure(
        "wear-summary",
        new Error("Model returned an empty summary"),
        "Could not summarize that. You can write your own.",
      );
    }

    return ok({ summary });
  } catch (err) {
    return upstreamFailure(
      "wear-summary",
      err,
      "Summary service unavailable. You can write your own.",
    );
  }
}
