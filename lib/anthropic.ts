import Anthropic from "@anthropic-ai/sdk";

// The model used for all AI features (profile extraction + listing scoring).
export const AI_MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

/**
 * Lazily instantiate the Anthropic client so the app can build without the
 * API key present. The key is only ever read server-side.
 */
export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ExtractedProfile {
  genres: string[];
  brands: string[];
  currentGuitars: string | null;
  dreamGuitar: string | null;
  maxSpend: number | null;
  sophistication: number;
}

export function buildExtractionPrompt(onboardingText: string): string {
  return `You are extracting a structured buyer profile from a guitar player's onboarding responses.

Onboarding text:
<text>
${onboardingText}
</text>

Extract and return JSON only, no other text:
{
  "genres": ["string"],
  "brands": ["string"],
  "currentGuitars": "string or null",
  "dreamGuitar": "string or null",
  "maxSpend": number or null,
  "sophistication": 1-5
}

sophistication scale:
1 = beginner (talks about strumming chords, doesn't know brands)
2 = intermediate (knows some brands, plays a few years)
3 = experienced (knows specific models, construction details)
4 = advanced (discusses tonewoods, vintage nuances, setup)
5 = expert (luthier-level knowledge, deep vintage market awareness)

Return only valid JSON.`;
}

/**
 * Run AI extraction on an onboarding transcript. Returns a structured profile.
 */
export async function extractProfile(
  onboardingText: string
): Promise<ExtractedProfile> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: buildExtractionPrompt(onboardingText) }],
  });

  const raw = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const json = stripJsonFences(raw);
  const parsed = JSON.parse(json) as Partial<ExtractedProfile>;

  return {
    genres: Array.isArray(parsed.genres) ? parsed.genres : [],
    brands: Array.isArray(parsed.brands) ? parsed.brands : [],
    currentGuitars: parsed.currentGuitars ?? null,
    dreamGuitar: parsed.dreamGuitar ?? null,
    maxSpend:
      typeof parsed.maxSpend === "number" ? Math.round(parsed.maxSpend) : null,
    sophistication: clampSophistication(parsed.sophistication),
  };
}

export interface ScoreListingInput {
  brand: string;
  model: string;
  year?: number | null;
  price: number;
  condition: string;
  description: string;
}

export interface ScoreBuyerInput {
  genres: string[];
  brands: string[];
  dreamGuitar?: string | null;
  maxSpend?: number | null;
  sophistication: number;
}

export function buildScoringPrompt(
  listing: ScoreListingInput,
  buyer: ScoreBuyerInput
): string {
  return `Score how well this guitar listing matches this buyer profile. Return a single integer 0-100.

Listing:
- Brand: ${listing.brand}
- Model: ${listing.model}
- Year: ${listing.year ?? "Unknown"}
- Price: $${listing.price}
- Condition: ${listing.condition}
- Description: ${listing.description}

Buyer profile:
- Genres: ${buyer.genres.join(", ") || "Unknown"}
- Preferred brands: ${buyer.brands.join(", ") || "Unknown"}
- Dream guitar: ${buyer.dreamGuitar ?? "Unknown"}
- Max spend: $${buyer.maxSpend ?? "Unknown"}
- Sophistication level: ${buyer.sophistication}/5

Scoring factors:
- Brand match (high weight)
- Price vs maxSpend (hard cutoff — if price > maxSpend, score cannot exceed 40)
- Genre/style fit based on guitar type
- Condition vs sophistication (experts care more)
- How close to dream guitar description

Return only the integer, nothing else.`;
}

/**
 * Score a single (listing, buyer) pair. Returns an integer 0-100.
 */
export async function scoreMatch(
  listing: ScoreListingInput,
  buyer: ScoreBuyerInput
): Promise<number> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 16,
    messages: [{ role: "user", content: buildScoringPrompt(listing, buyer) }],
  });

  const raw = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const n = parseInt(raw.replace(/[^0-9-]/g, ""), 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export interface WearSummaryInput {
  brand: string;
  model: string;
  year?: number | null;
  condition: string;
  wearAndTear: string;
}

export function buildWearPrompt(input: WearSummaryInput): string {
  const guitar =
    [input.year, input.brand, input.model].filter(Boolean).join(" ") ||
    "this guitar";

  return `You are summarizing a seller's description of wear and tear on a used acoustic guitar for a high-end guitar marketplace.

Guitar: ${guitar}
Seller's stated condition grade: ${input.condition}

The seller wrote the following about the instrument's wear, damage, repairs and modifications:
<wear>
${input.wearAndTear}
</wear>

Write a concise, factual summary for prospective buyers. Requirements:
- 2 to 4 sentences, plain prose, no bullet points and no headings.
- Lead with the most materially significant item (structural work, cracks, neck resets, repairs) before cosmetic wear.
- Preserve every specific detail the seller gave: locations, sizes, dates, who did the repair.
- Neutral and factual. Do not editorialize, do not reassure the buyer, do not add sales language.
- Never invent, soften, or omit a defect. If the seller's description is vague, say what they stated without embellishing.
- Do not restate the brand, model, year, or price.

Return only the summary text, with no preamble.`;
}

/**
 * Condense a seller's free-text wear-and-tear description into a short,
 * buyer-facing summary. The raw text is always kept alongside this.
 */
export async function summarizeWear(input: WearSummaryInput): Promise<string> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: buildWearPrompt(input) }],
  });

  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

function clampSophistication(value: unknown): number {
  const n = typeof value === "number" ? Math.round(value) : 1;
  return Math.max(1, Math.min(5, n));
}

function stripJsonFences(text: string): string {
  // Strip ```json ... ``` fences if the model wrapped its output.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Otherwise grab the first {...} block.
  const brace = text.match(/\{[\s\S]*\}/);
  return brace ? brace[0] : text;
}
