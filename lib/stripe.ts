import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Lazily instantiate the Stripe client so the app builds and serves without
 * payment credentials. The secret key is only ever read server-side.
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return client;
}

// Fee and tier rules live in lib/pricing so client components can quote a fee
// without bundling the Stripe SDK.
export { getListingFeeCents, getListingFeeDollars, getTier } from "./pricing";
