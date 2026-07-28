import { authFailure, badRequest, ok, upstreamFailure } from "@/lib/api";
import { randomUUID } from "crypto";
import { getPhotoUploadUrl } from "@/lib/cloudflare";
import { requireApiUser } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return authFailure(auth);
  const user = auth.user;
  let contentType = "image/jpeg";
  let ext = "jpg";
  try {
    const body = (await req.json()) as {
      contentType?: string;
      fileName?: string;
    };
    if (body.contentType) contentType = body.contentType;
    if (body.fileName?.includes(".")) {
      ext = body.fileName.split(".").pop()!.toLowerCase();
    }
  } catch {
    // fall back to defaults
  }

  if (!ALLOWED.includes(contentType)) {
    return badRequest("Unsupported image type");
  }

  const key = `listings/${user.id}/${randomUUID()}.${ext}`;

  try {
    const { uploadUrl, publicUrl } = await getPhotoUploadUrl(key, contentType);
    return ok({ uploadUrl, publicUrl, key });
  } catch (err) {
    return upstreamFailure("upload/photo", err, "Could not create upload URL");
  }
}
