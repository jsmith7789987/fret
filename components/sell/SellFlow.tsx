"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { CONDITIONS, formatPrice } from "@/lib/format";

type Step = 0 | 1 | 2 | 3;

interface Details {
  brand: string;
  model: string;
  year: string;
  finish: string;
  condition: string;
  description: string;
  price: string;
  city: string;
  state: string;
}

const EMPTY_DETAILS: Details = {
  brand: "",
  model: "",
  year: "",
  finish: "",
  condition: "EXCELLENT",
  description: "",
  price: "",
  city: "",
  state: "",
};

function StepHeader({ step }: { step: Step }) {
  const labels = ["Video", "Photos", "Details", "Review & pay"];
  return (
    <div className="mb-8 flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] ${
              i <= step ? "bg-ink text-white" : "bg-hairline text-muted"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`text-[13px] ${i === step ? "text-ink" : "text-muted"}`}
          >
            {label}
          </span>
          {i < labels.length - 1 && (
            <span className="mx-1 h-px w-6 bg-hairline" />
          )}
        </div>
      ))}
    </div>
  );
}

export function SellFlow() {
  const [step, setStep] = useState<Step>(0);

  // Step 1 — video
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);

  // Step 2 — photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Step 3 — details
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);

  // Step 4 — submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVideo(file: File) {
    setError(null);
    setVideoUploading(true);
    setVideoProgress(0);
    try {
      const res = await fetch("/api/upload/video", { method: "POST" });
      if (!res.ok) throw new Error("Could not get upload URL");
      const { uploadURL, videoId: id } = (await res.json()) as {
        uploadURL: string;
        videoId: string;
      };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadURL);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setVideoProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error("Upload failed"));
        xhr.onerror = () => reject(new Error("Upload failed"));
        const form = new FormData();
        form.append("file", file);
        xhr.send(form);
      });

      setVideoId(id);
      setVideoProgress(100);
    } catch (err) {
      console.error(err);
      setError("Video upload failed. Please try again.");
    } finally {
      setVideoUploading(false);
    }
  }

  async function handlePhotos(files: FileList) {
    setError(null);
    const remaining = 10 - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    setPhotoUploading(true);
    try {
      for (const file of toUpload) {
        const res = await fetch("/api/upload/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: file.type,
            fileName: file.name,
          }),
        });
        if (!res.ok) throw new Error("Could not get upload URL");
        const { uploadUrl, publicUrl } = (await res.json()) as {
          uploadUrl: string;
          publicUrl: string;
        };
        const put = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!put.ok) throw new Error("Upload failed");
        setPhotos((prev) => [...prev, publicUrl]);
      }
    } catch (err) {
      console.error(err);
      setError("One or more photos failed to upload.");
    } finally {
      setPhotoUploading(false);
    }
  }

  function updateDetail<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  const priceNum = Number(details.price);
  const detailsValid =
    details.brand.trim() &&
    details.model.trim() &&
    details.description.trim() &&
    Number.isFinite(priceNum) &&
    priceNum > 0;

  const fee = priceNum >= 2500 ? 50 : 25;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: details.brand.trim(),
          model: details.model.trim(),
          year: details.year ? Number(details.year) : null,
          finish: details.finish.trim() || null,
          condition: details.condition,
          description: details.description.trim(),
          price: priceNum,
          city: details.city.trim() || null,
          state: details.state.trim() || null,
          videoId,
          photos,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("Could not start checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <StepHeader step={step} />

      {error && (
        <p className="mb-4 rounded-card border border-amber-border bg-amber-bg px-4 py-2 text-[13px] text-amber-text">
          {error}
        </p>
      )}

      {/* STEP 1 — VIDEO */}
      {step === 0 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">
            Upload a walkthrough video
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            Every fret. listing requires a video. Show the front, back, headstock
            and play a few bars. Up to 10 minutes.
          </p>

          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-hairline bg-white py-12 text-center hover:border-ink">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleVideo(e.target.files[0])}
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

          {videoUploading && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full bg-ink transition-all"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button onClick={() => setStep(1)} disabled={!videoId}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — PHOTOS */}
      {step === 1 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">Add photos</h2>
          <p className="mt-2 text-[13px] text-muted">
            Up to 10 photos. The first becomes the cover if there&apos;s no video
            thumbnail.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-card border-[0.5px] border-hairline"
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

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-[13px] text-muted hover:text-ink"
            >
              Back
            </button>
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {/* STEP 3 — DETAILS */}
      {step === 2 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">Guitar details</h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Field label="Brand" required>
              <input
                className="fret-input"
                value={details.brand}
                onChange={(e) => updateDetail("brand", e.target.value)}
                placeholder="Martin"
              />
            </Field>
            <Field label="Model" required>
              <input
                className="fret-input"
                value={details.model}
                onChange={(e) => updateDetail("model", e.target.value)}
                placeholder="D-18"
              />
            </Field>
            <Field label="Year">
              <input
                className="fret-input"
                value={details.year}
                onChange={(e) =>
                  updateDetail("year", e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="1968"
                inputMode="numeric"
              />
            </Field>
            <Field label="Finish">
              <input
                className="fret-input"
                value={details.finish}
                onChange={(e) => updateDetail("finish", e.target.value)}
                placeholder="Natural"
              />
            </Field>
            <Field label="Condition" required>
              <select
                className="fret-input"
                value={details.condition}
                onChange={(e) => updateDetail("condition", e.target.value)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Price (USD)" required>
              <input
                className="fret-input"
                value={details.price}
                onChange={(e) =>
                  updateDetail("price", e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="2750"
                inputMode="numeric"
              />
            </Field>
            <Field label="City">
              <input
                className="fret-input"
                value={details.city}
                onChange={(e) => updateDetail("city", e.target.value)}
                placeholder="Asheville"
              />
            </Field>
            <Field label="State">
              <input
                className="fret-input"
                value={details.state}
                onChange={(e) => updateDetail("state", e.target.value)}
                placeholder="NC"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Description" required>
              <textarea
                className="fret-input resize-none"
                rows={5}
                value={details.description}
                onChange={(e) => updateDetail("description", e.target.value)}
                placeholder="Tone, history, any wear or repairs, what makes it special…"
              />
            </Field>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[13px] text-muted hover:text-ink"
            >
              Back
            </button>
            <Button onClick={() => setStep(3)} disabled={!detailsValid}>
              Review
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 — REVIEW & PAY */}
      {step === 3 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">Review &amp; pay</h2>

          <div className="mt-6 rounded-card border-[0.5px] border-hairline bg-white p-5">
            <p className="font-serif text-[20px] text-ink">
              {[details.year, details.brand, details.model]
                .filter(Boolean)
                .join(" ")}
            </p>
            <p className="mt-1 text-[13px] text-muted">
              {[
                details.finish,
                CONDITIONS.find((c) => c.value === details.condition)?.label,
                [details.city, details.state].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-3 text-[18px] font-medium text-ink">
              {formatPrice(priceNum || 0)}
            </p>
            <div className="mt-3 flex gap-4 text-[12px] text-muted">
              <span>{videoId ? "✓ Video" : "No video"}</span>
              <span>
                {photos.length} photo{photos.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-card border-[0.5px] border-hairline bg-white px-5 py-4">
            <div>
              <p className="text-[14px] font-medium text-ink">Listing fee</p>
              <p className="text-[12px] text-muted">
                {priceNum >= 2500 ? "Premium ($2,500+)" : "Standard"} — one-time
              </p>
            </div>
            <p className="font-serif text-[22px] text-ink">${fee}</p>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-[13px] text-muted hover:text-ink"
            >
              Back
            </button>
            <Button onClick={submit} disabled={submitting || !detailsValid}>
              {submitting ? "Starting checkout…" : `Pay $${fee} & publish`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted">
        {label}
        {required && <span className="text-amber"> *</span>}
      </span>
      {children}
    </label>
  );
}
