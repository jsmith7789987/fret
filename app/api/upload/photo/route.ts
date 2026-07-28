import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPhotoUploadUrl } from "@/lib/cloudflare";
import { requireApiUser } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
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
    return NextResponse.json(
      { error: "Unsupported image type" },
      { status: 400 },
    );
  }

  const key = `listings/${user.id}/${randomUUID()}.${ext}`;

  try {
    const { uploadUrl, publicUrl } = await getPhotoUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("Photo upload URL failed:", err);
    return NextResponse.json(
      { error: "Could not create upload URL" },
      { status: 502 },
    );
  }
}
