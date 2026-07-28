"use client";

export function VideoStep({
  videoId,
  videoUploading,
  videoProgress,
  videoUnavailable,
  handleVideo,
}: {
  videoId: string | null;
  videoUploading: boolean;
  videoProgress: number;
  videoUnavailable: boolean;
  handleVideo: (file: File) => void;
}) {
  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-[24px] text-ink">
        Upload a walkthrough video
      </h2>
      <p className="mt-2 text-[13px] text-muted">
        Every fret. listing requires a video. Show the front, back, headstock
        and any wear, then play a few bars. Up to 10 minutes.
      </p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-hairline bg-white py-12 text-center hover:border-ink">
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleVideo(e.target.files[0])
          }
          disabled={videoUploading}
        />
        {videoId ? (
          <span className="text-[14px] font-medium text-ink">
            ✓ Video uploaded
          </span>
        ) : videoUploading ? (
          <span className="text-[14px] text-muted">
            Uploading… {videoProgress}%
          </span>
        ) : (
          <span className="text-[14px] text-muted">
            Click to select a video file
          </span>
        )}
      </label>

      {videoUnavailable && (
        <p className="mt-3 rounded-card border border-match-border bg-match-bg px-4 py-3 text-[13px] text-match-text">
          Video hosting isn&apos;t configured on this deployment, so the video
          requirement is waived for now. Set the Cloudflare Stream environment
          variables to turn it back on.
        </p>
      )}

      {videoUploading && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-hairline">
          <div
            className="h-full bg-ink transition-all"
            style={{ width: `${videoProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
