import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { authFailure, badRequest, ok, readJson } from "@/lib/api";

/** Toggle a saved listing for the current user. */
export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return authFailure(auth);
  const user = auth.user;

  const body = await readJson<{ listingId?: string }>(req);
  if (!body) return badRequest("Invalid body");

  const listingId = body.listingId ?? "";
  if (!listingId) return badRequest("listingId required");

  const existing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.savedListing.delete({ where: { id: existing.id } });
    return ok({ saved: false });
  }

  await prisma.savedListing.create({ data: { userId: user.id, listingId } });
  return ok({ saved: true });
}
