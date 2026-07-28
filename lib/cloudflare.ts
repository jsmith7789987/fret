import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ----- Cloudflare R2 (S3-compatible) -----

let r2: S3Client | null = null;

function getR2(): S3Client {
  const {
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  } = process.env;

  if (
    !CLOUDFLARE_ACCOUNT_ID ||
    !CLOUDFLARE_R2_ACCESS_KEY_ID ||
    !CLOUDFLARE_R2_SECRET_ACCESS_KEY
  ) {
    throw new Error("Cloudflare R2 credentials are not set");
  }

  if (!r2) {
    r2 = new S3Client({
      region: "auto",
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2;
}

/**
 * Generate a presigned PUT URL for a photo upload to R2.
 * Returns the upload URL plus the eventual public URL.
 */
export async function getPhotoUploadUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucket) throw new Error("CLOUDFLARE_R2_BUCKET_NAME is not set");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getR2(), command, { expiresIn: 600 });
  const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}

// ----- Cloudflare Stream -----

/**
 * Request a one-time direct-creator-upload URL from Cloudflare Stream.
 * The browser uploads the file directly to the returned URL (tus/simple PUT).
 */
export async function getStreamUploadUrl(maxDurationSeconds = 600): Promise<{
  uploadURL: string;
  videoId: string;
}> {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN } = process.env;
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
    throw new Error("Cloudflare Stream credentials are not set");
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ maxDurationSeconds }),
    },
  );

  if (!res.ok) {
    throw new Error(
      `Cloudflare Stream upload URL request failed: ${res.status}`,
    );
  }

  const data = (await res.json()) as {
    result: { uploadURL: string; uid: string };
  };

  return { uploadURL: data.result.uploadURL, videoId: data.result.uid };
}

export function streamThumbnailUrl(videoId: string): string {
  return `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`;
}

