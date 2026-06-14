"use client";

export function VideoPlayer({
  videoId,
  poster,
}: {
  videoId: string;
  poster?: string | null;
}) {
  const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
  const src = accountId
    ? `https://customer-${accountId}.cloudflarestream.com/${videoId}/iframe${
        poster ? `?poster=${encodeURIComponent(poster)}` : ""
      }`
    : `https://iframe.cloudflarestream.com/${videoId}`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card bg-ink">
      <iframe
        src={src}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        style={{ border: "none" }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        title="Listing video"
      />
    </div>
  );
}
