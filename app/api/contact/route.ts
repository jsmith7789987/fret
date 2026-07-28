import {
  authFailure,
  badRequest,
  notFound,
  ok,
  upstreamFailure,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { sendContactEmail } from "@/lib/resend";

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return authFailure(auth);
  const user = auth.user;

  let listingId = "";
  let message = "";
  try {
    const body = (await req.json()) as {
      listingId?: string;
      message?: string;
    };
    listingId = body.listingId ?? "";
    message = (body.message ?? "").trim();
  } catch {
    return badRequest("Invalid body");
  }

  if (!listingId || !message) {
    return badRequest("listingId and message are required");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: true },
  });

  if (!listing) {
    return notFound("Listing not found");
  }

  try {
    await sendContactEmail(listing.seller.email, user.email, message, {
      brand: listing.brand,
      model: listing.model,
      id: listing.id,
    });
  } catch (err) {
    return upstreamFailure("contact", err, "Could not send message");
  }

  return ok({ ok: true });
}
