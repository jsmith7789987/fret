import { prisma } from "./prisma";
import type { User } from "@prisma/client";

/**
 * fret. currently runs without a sign-in wall — there is no sign-in page and
 * no auth provider in the render path. Everything resolves to a single shared
 * guest account so the browse, onboarding and sell flows are fully usable.
 *
 * When real auth is reintroduced, this is the one function to change: resolve
 * the signed-in user here and every caller keeps working.
 */

const GUEST_CLERK_ID = "guest";
const GUEST_EMAIL = "guest@fret.market";

/** Used when the database is unreachable, so pages still render. */
const OFFLINE_GUEST: User = {
  id: "guest-offline",
  clerkId: GUEST_CLERK_ID,
  email: GUEST_EMAIL,
  role: "SELLER",
  firstName: "Guest",
  phone: null,
  createdAt: new Date(0),
};

/**
 * Resolve the acting user. Returns the shared guest account, creating it on
 * first use. Never throws — if Postgres is unreachable it returns an offline
 * stand-in so pages render instead of 500-ing.
 */
export async function getCurrentDbUser(): Promise<User> {
  try {
    return await prisma.user.upsert({
      where: { clerkId: GUEST_CLERK_ID },
      update: {},
      create: {
        clerkId: GUEST_CLERK_ID,
        email: GUEST_EMAIL,
        firstName: "Guest",
        role: "SELLER",
      },
    });
  } catch (err) {
    console.error("Could not resolve guest user (database unreachable):", err);
    return OFFLINE_GUEST;
  }
}

/** True when the user is the offline stand-in — i.e. writes will not persist. */
export function isOfflineUser(user: User): boolean {
  return user.id === OFFLINE_GUEST.id;
}
