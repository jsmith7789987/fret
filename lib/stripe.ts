import Stripe from "stripe";

let client: Stripe | null = null;

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

/**
 * Listing fee, in cents (Stripe wants cents).
 * - Dealers: flat $25
 * - Standard (< $2,500): $25
 * - Premium ($2,500+): $50
 */
export function getListingFee(price: number, isDealer: boolean): number {
  if (isDealer) return 25_00; // $25 in cents
  if (price >= 2500) return 50_00; // $50
  return 25_00; // $25
}

import type { ListingTier } from "@prisma/client";

export function getTier(price: number, isDealer: boolean): ListingTier {
  if (isDealer) return "DEALER";
  if (price >= 2500) return "PREMIUM";
  return "STANDARD";
}
