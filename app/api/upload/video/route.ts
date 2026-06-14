import { NextResponse } from "next/server";
import { getStreamUploadUrl } from "@/lib/cloudflare";
import { getCurrentDbUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uploadURL, videoId } = await getStreamUploadUrl();
    return NextResponse.json({ uploadURL, videoId });
  } catch (err) {
    console.error("Video upload URL failed:", err);
    return NextResponse.json(
      { error: "Could not create upload URL" },
      { status: 502 }
    );
  }
}
