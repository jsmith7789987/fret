import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreMatch } from "@/lib/anthropic";
import { sendMatchAlert } from "@/lib/twilio";
import type { BuyerProfile, Listing, User } from "@prisma/client";

export const maxDuration = 300; // allow long-running scoring

const ALERT_THRESHOLD = 85;
const BATCH_SIZE = 10;

type BuyerWithUser = BuyerProfile & { user: User };

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function scorePair(
  listing: Listing,
  buyer: BuyerWithUser
): Promise<void> {
  const score = await scoreMatch(
    {
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      price: listing.price,
      condition: listing.condition,
      description: listing.description,
    },
    {
      genres: buyer.genres,
      brands: buyer.brands,
      dreamGuitar: buyer.dreamGuitar,
      maxSpend: buyer.maxSpend,
      sophistication: buyer.sophistication,
    }
  );

  const existing = await prisma.matchScore.findUnique({
    where: {
      listingId_buyerId: { listingId: listing.id, buyerId: buyer.userId },
    },
  });

  const record = await prisma.matchScore.upsert({
    where: {
      listingId_buyerId: { listingId: listing.id, buyerId: buyer.userId },
    },
    update: { score },
    create: { listingId: listing.id, buyerId: buyer.userId, score },
  });

  const alreadyAlerted = existing?.alertSent ?? false;

  if (score >= ALERT_THRESHOLD && !alreadyAlerted && buyer.user.phone) {
    try {
      await sendMatchAlert(buyer.user.phone, {
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
        price: listing.price,
        id: listing.id,
      });
      await prisma.matchScore.update({
        where: { id: record.id },
        data: { alertSent: true },
      });
      await prisma.alert.create({
        data: {
          userId: buyer.userId,
          listingId: listing.id,
          channel: "sms",
        },
      });
    } catch (err) {
      console.error("Failed to send match alert:", err);
    }
  }
}

async function runBatches<T>(items: T[], fn: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(fn));
  }
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [listings, buyers] = await Promise.all([
    prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ createdAt: { gte: since } }, { updatedAt: { gte: since } }],
      },
    }),
    prisma.buyerProfile.findMany({ include: { user: true } }),
  ]);

  // Build every (listing, buyer) pair, then score in batches of 10.
  const pairs: { listing: Listing; buyer: BuyerWithUser }[] = [];
  for (const listing of listings) {
    for (const buyer of buyers) {
      pairs.push({ listing, buyer });
    }
  }

  let scored = 0;
  await runBatches(pairs, async ({ listing, buyer }) => {
    try {
      await scorePair(listing, buyer);
      scored += 1;
    } catch (err) {
      console.error(
        `Scoring failed for listing ${listing.id} / buyer ${buyer.userId}:`,
        err
      );
    }
  });

  return NextResponse.json({
    listings: listings.length,
    buyers: buyers.length,
    pairsScored: scored,
  });
}

// Allow GET for simple cron services that only do GET requests.
export const GET = POST;
