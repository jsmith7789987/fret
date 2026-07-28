import { NextResponse } from "next/server";
import { authFailure, badRequest, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getListingFeeCents, getTier } from "@/lib/pricing";
import { streamThumbnailUrl } from "@/lib/cloudflare";
import { MIN_NEW_PRICE } from "@/lib/guitars";
import { isCondition } from "@/lib/format";

interface CreateBody {
  brand?: string;
  model?: string;
  year?: number | null;
  finish?: string | null;
  condition?: string;
  description?: string;
  price?: number;
  city?: string | null;
  state?: string | null;
  videoId?: string | null;
  photos?: string[];
  serialNumber?: string;
  bodyShape?: string | null;
  topWood?: string | null;
  backSidesWood?: string | null;
  neckWood?: string | null;
  fretboardWood?: string | null;
  bracing?: string | null;
  nutWidth?: string | null;
  scaleLength?: string | null;
  finishType?: string | null;
  electronics?: string | null;
  caseType?: string | null;
  countryOfOrigin?: string | null;
  modifications?: string | null;
  wearAndTear?: string | null;
  wearSummary?: string | null;
}

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return authFailure(auth);
  const user = auth.user;

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return badRequest("Invalid body");
  }

  const { brand, model, description } = body;
  const price = Number(body.price);

  if (!brand || !model || !description) {
    return badRequest("brand, model and description are required");
  }
  // Serial number is mandatory for every listing on fret.
  const serialNumber = (body.serialNumber ?? "").trim();
  if (!serialNumber) {
    return badRequest("A serial number is required for every listing.");
  }
  if (!isCondition(body.condition)) {
    return badRequest("Invalid condition");
  }
  const condition = body.condition;
  if (!Number.isFinite(price) || price <= 0) {
    return badRequest("Invalid price");
  }
  // fret. is luxury-only: nothing on the site sold under $3,000 new.
  if (price < MIN_NEW_PRICE) {
    return badRequest(
      `fret. only lists guitars from $${MIN_NEW_PRICE.toLocaleString("en-US")} up.`,
    );
  }

  const isDealer = user.role === "DEALER";
  const tier = getTier(price, isDealer);

  const listing = await prisma.listing.create({
    data: {
      sellerId: user.id,
      brand,
      model,
      year: body.year ?? null,
      finish: body.finish ?? null,
      condition,
      description,
      price,
      city: body.city ?? null,
      state: body.state ?? null,
      serialNumber,
      bodyShape: body.bodyShape ?? null,
      topWood: body.topWood ?? null,
      backSidesWood: body.backSidesWood ?? null,
      neckWood: body.neckWood ?? null,
      fretboardWood: body.fretboardWood ?? null,
      bracing: body.bracing ?? null,
      nutWidth: body.nutWidth ?? null,
      scaleLength: body.scaleLength ?? null,
      finishType: body.finishType ?? null,
      electronics: body.electronics ?? null,
      caseType: body.caseType ?? null,
      countryOfOrigin: body.countryOfOrigin ?? null,
      modifications: body.modifications ?? null,
      wearAndTear: body.wearAndTear ?? null,
      wearSummary: body.wearSummary ?? null,
      videoId: body.videoId ?? null,
      videoThumb: body.videoId ? streamThumbnailUrl(body.videoId) : null,
      photos: Array.isArray(body.photos) ? body.photos.slice(0, 10) : [],
      status: "PENDING_PAYMENT",
      tier,
    },
  });

  // Create the Stripe checkout session for the listing fee.
  const feeInCents = getListingFeeCents(price, isDealer);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: feeInCents,
            product_data: {
              name: `fret. listing fee. ${tier.toLowerCase()}`,
              description: `${brand} ${model}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { listingId: listing.id, sellerId: user.id },
      success_url: `${appUrl}/dashboard?listed=${listing.id}`,
      cancel_url: `${appUrl}/sell?canceled=${listing.id}`,
    });

    return ok({ listingId: listing.id, url: session.url });
  } catch (err) {
    console.error("[listings] Stripe checkout failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout", listingId: listing.id },
      { status: 502 },
    );
  }
}
