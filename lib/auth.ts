import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

/**
 * Resolve the current Clerk user to our local DB User record.
 * Lazily creates the record if the Clerk webhook hasn't fired yet.
 * Returns null when there is no signed-in user.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  // auth()/currentUser() throw if Clerk env isn't configured. Degrade to "no
  // user" so pages can redirect instead of returning a 500.
  let userId: string | null = null;
  try {
    userId = (await auth()).userId;
  } catch {
    return null;
  }
  if (!userId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (user) return user;

  // Fallback: webhook may not have run yet. Create from Clerk data.
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email,
      firstName: clerkUser.firstName ?? null,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
    },
  });

  return user;
}
