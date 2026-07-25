import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { getStripe, getListingFee, getTier } from "@/lib/stripe";
import { streamThumbnailUrl } from "@/lib/cloudflare";
import { MIN_NEW_PRICE } from "@/lib/guitars";
import type { Condition } from "@prisma/client";

const CONDITIONS = [
  "MINT",
  "EXCELLENT",
  "VERY_GOOD_PLUS",
  "VERY_GOOD",
  "GOOD",
  "FAIR",
];

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
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { brand, model, description } = body;
  const price = Number(body.price);
  const condition = body.condition as Condition | undefined;

  if (!brand || !model || !description) {
    return NextResponse.json(
      { error: "brand, model and description are required" },
      { status: 400 }
    );
  }
  // Serial number is mandatory for every listing on fret.
  const serialNumber = (body.serialNumber ?? "").trim();
  if (!serialNumber) {
    return NextResponse.json(
      { error: "A serial number is required for every listing." },
      { status: 400 }
    );
  }
  if (!condition || !CONDITIONS.includes(condition)) {
    return NextResponse.json({ error: "Invalid condition" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }
  // fret. is luxury-only: nothing on the site sold under $3,000 new.
  if (price < MIN_NEW_PRICE) {
    return NextResponse.json(
      {
        error: `fret. only lists guitars from $${MIN_NEW_PRICE.toLocaleString(
          "en-US"
        )} up.`,
      },
      { status: 400 }
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
  const fee = getListingFee(price, isDealer);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: fee,
            product_data: {
              name: `fret. listing fee — ${tier.toLowerCase()}`,
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

    return NextResponse.json({ listingId: listing.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout", listingId: listing.id },
      { status: 502 }
    );
  }
}
