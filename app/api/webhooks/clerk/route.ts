import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type ClerkEmail = { id: string; email_address: string };
type ClerkPhone = { id: string; phone_number: string };
type ClerkUserData = {
  id: string;
  email_addresses: ClerkEmail[];
  primary_email_address_id: string | null;
  phone_numbers: ClerkPhone[];
  first_name: string | null;
};

interface ClerkEvent {
  type: string;
  data: ClerkUserData;
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const h = headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  let event: ClerkEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const data = event.data;

  if (event.type === "user.created" || event.type === "user.updated") {
    const email =
      data.email_addresses.find((e) => e.id === data.primary_email_address_id)
        ?.email_address ?? data.email_addresses[0]?.email_address;

    if (!email) {
      return new Response("No email on user", { status: 400 });
    }

    const phone = data.phone_numbers[0]?.phone_number ?? null;

    await prisma.user.upsert({
      where: { clerkId: data.id },
      update: { email, firstName: data.first_name, phone },
      create: {
        clerkId: data.id,
        email,
        firstName: data.first_name,
        phone,
      },
    });
  }

  if (event.type === "user.deleted") {
    await prisma.user
      .delete({ where: { clerkId: data.id } })
      .catch(() => null);
  }

  return new Response("ok", { status: 200 });
}
