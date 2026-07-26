import { NextResponse } from "next/server";
import { getStreamUploadUrl } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

function streamConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_STREAM_API_TOKEN
  );
}

export async function POST() {
  // Distinguish "video hosting isn't set up on this deployment" from a genuine
  // upload failure — the seller flow uses this to stay walkable either way.
  if (!streamConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        error: "Video hosting is not configured on this deployment.",
      },
      { status: 503 }
    );
  }

  try {
    const { uploadURL, videoId } = await getStreamUploadUrl();
    return NextResponse.json({ configured: true, uploadURL, videoId });
  } catch (err) {
    console.error("Video upload URL failed:", err);
    return NextResponse.json(
      { configured: true, error: "Could not create upload URL" },
      { status: 502 }
    );
  }
}
