import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  let userId: string | null = null;
  try {
    userId = (await auth()).userId;
  } catch {
    // Clerk not configured yet — fall through to the marketing page.
  }

  if (userId) {
    redirect("/browse");
  }
  redirect("/welcome");
}
