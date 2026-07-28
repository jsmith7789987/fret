import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { Role, User } from "@prisma/client";
import { isAuthConfigured } from "./config";

export { isAuthConfigured };

/**
 * Authentication and backend authorization.
 *
 * Browsing is public. Signing in is required to build a profile, sell, or
 * reach admin. Authorization is enforced here on the server, not by hiding
 * UI, so a seller cannot act on another seller's listing by calling the API
 * directly.
 */

/**
 * The signed-in user's Clerk id, or null when nobody is signed in or Clerk
 * is not configured on this deployment.
 */
export async function getClerkUserId(): Promise<string | null> {
  if (!isAuthConfigured()) return null;
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve the signed-in user to the local database record. Returns null when
 * nobody is signed in. Creates the record on first sight if the Clerk webhook
 * has not delivered it yet, so a fresh signup is never stuck.
 */
export async function getCurrentUser(): Promise<User | null> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return null;

  try {
    const existing = await prisma.user.findUnique({ where: { clerkId } });
    if (existing) return existing;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) return null;

    return await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        email,
        firstName: clerkUser.firstName ?? null,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
      },
    });
  } catch (err) {
    console.error("[auth] Could not resolve current user:", err);
    return null;
  }
}

/**
 * For server components on protected pages. Sends anyone not signed in to
 * sign-in, and returns back to where they were afterwards.
 */
export async function requireUser(returnTo?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const target = returnTo
      ? `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`
      : "/sign-in";
    redirect(target);
  }
  return user;
}

/**
 * For server components that require one of the given roles.
 * ADMIN passes every role check.
 */
export async function requireRole(
  roles: Role[],
  returnTo?: string,
): Promise<User> {
  const user = await requireUser(returnTo);
  if (user.role !== "ADMIN" && !roles.includes(user.role)) {
    redirect("/browse");
  }
  return user;
}

export type ApiAuthFailure = { ok: false; status: 401 | 403; error: string };
export type ApiAuthSuccess = { ok: true; user: User };

/**
 * For API routes. Returns a typed result instead of redirecting so the route
 * can respond with the right status code.
 */
export async function requireApiUser(): Promise<
  ApiAuthSuccess | ApiAuthFailure
> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, status: 401, error: "You must be signed in." };
  }
  return { ok: true, user };
}

/** For API routes that require one of the given roles. ADMIN always passes. */
export async function requireApiRole(
  roles: Role[],
): Promise<ApiAuthSuccess | ApiAuthFailure> {
  const result = await requireApiUser();
  if (!result.ok) return result;
  if (result.user.role !== "ADMIN" && !roles.includes(result.user.role)) {
    return { ok: false, status: 403, error: "You do not have access to this." };
  }
  return result;
}

/** True when the user owns the record, or is an admin. */
export function ownsOrAdmin(user: User, ownerId: string): boolean {
  return user.id === ownerId || user.role === "ADMIN";
}
