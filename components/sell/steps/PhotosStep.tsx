"use client";

export function PhotosStep({
  photos,
  photoUploading,
  handlePhotos,
  setPhotos,
}: {
  photos: string[];
  photoUploading: boolean;
  handlePhotos: (files: FileList) => void;
  setPhotos: (update: (previous: string[]) => string[]) => void;
}) {
  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-[24px] text-ink">Add photos</h2>
      <p className="mt-2 text-[13px] text-muted">
        Up to 10. Include close-ups of any wear you describe later.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-card border-[0.5px] border-hairline"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
              className="absolute right-1 top-1 rounded-full bg-ink/80 px-1.5 text-[12px] text-white"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < 10 && (
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-card border border-dashed border-hairline bg-white text-[24px] text-muted hover:border-ink">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handlePhotos(e.target.files)}
              disabled={photoUploading}
            />
            +
          </label>
        )}
      </div>
      {photoUploading && (
        <p className="mt-3 text-[12px] text-muted">Uploading photos…</p>
      )}
    </div>
  );
}
