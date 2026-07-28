import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { indexListing } from "@/lib/typesense";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Stripe webhook secret not configured", {
      status: 500,
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[webhooks/stripe] Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = session.metadata?.listingId;

    if (listingId) {
      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { status: "ACTIVE", stripeSessionId: session.id },
      });
      // Add to the search index now that it's live.
      await indexListing(listing);
    }
  }

  return new Response("ok", { status: 200 });
}
