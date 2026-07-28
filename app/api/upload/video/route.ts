import { notConfigured, ok, upstreamFailure } from "@/lib/api";
import { getStreamUploadUrl } from "@/lib/cloudflare";
import { isStreamConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST() {
  // Distinguish "video hosting isn't set up on this deployment" from a genuine
  // upload failure. The seller flow uses this to stay walkable either way.
  if (!isStreamConfigured()) {
    return notConfigured("Video hosting is not configured on this deployment.");
  }

  try {
    const { uploadURL, videoId } = await getStreamUploadUrl();
    return ok({ configured: true, uploadURL, videoId });
  } catch (err) {
    return upstreamFailure("upload/video", err, "Could not create upload URL");
  }
}
