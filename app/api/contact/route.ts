import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser, isOfflineUser } from "@/lib/auth";
import { sendContactEmail } from "@/lib/resend";

export async function POST(req: Request) {
  const user = await getCurrentDbUser();
  if (isOfflineUser(user)) {
    return NextResponse.json(
      { error: "Database unavailable — try again shortly." },
      { status: 503 }
    );
  }

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
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!listingId || !message) {
    return NextResponse.json(
      { error: "listingId and message are required" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  try {
    await sendContactEmail(listing.seller.email, user.email, message, {
      brand: listing.brand,
      model: listing.model,
      id: listing.id,
    });
  } catch (err) {
    console.error("Contact email failed:", err);
    return NextResponse.json(
      { error: "Could not send message" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
