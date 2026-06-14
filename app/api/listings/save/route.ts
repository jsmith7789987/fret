import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";

/** Toggle a saved listing for the current user. */
export async function POST(req: Request) {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let listingId = "";
  try {
    const body = (await req.json()) as { listingId?: string };
    listingId = body.listingId ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  const existing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.savedListing.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedListing.create({ data: { userId: user.id, listingId } });
  return NextResponse.json({ saved: true });
}
