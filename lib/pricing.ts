import type { ListingTier } from "@prisma/client";

/**
 * Listing fee rules.
 *
 * Kept apart from lib/stripe.ts so the seller UI can quote a fee without
 * pulling the Stripe SDK into the browser bundle. One definition, used by both
 * the quote and the charge, so a seller is always billed what they were shown.
 *
 * Note for review: PREMIUM_FROM sits below MIN_NEW_PRICE in lib/guitars, so
 * today every non-dealer listing lands in the premium tier and STANDARD is
 * unreachable. Confirm the intended thresholds before changing these numbers.
 */
const PREMIUM_FROM = 2500;
const STANDARD_FEE = 25;
const PREMIUM_FEE = 50;
const DEALER_FEE = 25;

/** True when this price falls in the premium tier. */
export function isPremiumPrice(price: number): boolean {
  return price >= PREMIUM_FROM;
}

/** Listing fee in whole dollars, for display. */
export function getListingFeeDollars(price: number, isDealer: boolean): number {
  if (isDealer) return DEALER_FEE;
  return isPremiumPrice(price) ? PREMIUM_FEE : STANDARD_FEE;
}

/** Listing fee in cents, which is what Stripe expects. */
export function getListingFeeCents(price: number, isDealer: boolean): number {
  return getListingFeeDollars(price, isDealer) * 100;
}

export function getTier(price: number, isDealer: boolean): ListingTier {
  if (isDealer) return "DEALER";
  return isPremiumPrice(price) ? "PREMIUM" : "STANDARD";
}
