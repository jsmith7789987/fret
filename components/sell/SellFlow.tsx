"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { CONDITIONS, formatPrice, guitarTitle } from "@/lib/format";
import { getListingFeeDollars, isPremiumPrice } from "@/lib/pricing";
import {
  MAJOR_BRANDS,
  BOUTIQUE_BRANDS,
  BODY_SHAPES,
  TOP_WOODS,
  BACK_SIDES_WOODS,
  NECK_WOODS,
  FRETBOARD_WOODS,
  BRACING_PATTERNS,
  NUT_WIDTHS,
  SCALE_LENGTHS,
  FINISH_TYPES,
  ELECTRONICS,
  CASE_TYPES,
  COUNTRIES,
  MIN_NEW_PRICE,
  modelsForBrand,
} from "@/lib/guitars";

const STEPS = [
  "Video",
  "Photos",
  "The guitar",
  "Build specs",
  "Condition",
  "Price",
  "Review & pay",
] as const;

interface Details {
  // Identity
  brand: string;
  model: string;
  year: string;
  serialNumber: string;
  bodyShape: string;
  countryOfOrigin: string;
  // Build
  topWood: string;
  backSidesWood: string;
  neckWood: string;
  fretboardWood: string;
  bracing: string;
  nutWidth: string;
  scaleLength: string;
  finish: string;
  finishType: string;
  electronics: string;
  caseType: string;
  modifications: string;
  // Condition
  condition: string;
  wearAndTear: string;
  wearSummary: string;
  description: string;
  // Commercial
  price: string;
  city: string;
  state: string;
}

const EMPTY_DETAILS: Details = {
  brand: "",
  model: "",
  year: "",
  serialNumber: "",
  bodyShape: "",
  countryOfOrigin: "United States",
  topWood: "",
  backSidesWood: "",
  neckWood: "",
  fretboardWood: "",
  bracing: "",
  nutWidth: "",
  scaleLength: "",
  finish: "",
  finishType: "",
  electronics: "",
  caseType: "",
  modifications: "",
  condition: "EXCELLENT",
  wearAndTear: "",
  wearSummary: "",
  description: "",
  price: "",
  city: "",
  state: "",
};

export function SellFlow() {
  const [step, setStep] = useState(0);

  // Step 1. video
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  // Set when this deployment has no video hosting configured. the video
  // requirement is waived so the rest of the flow stays walkable.
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  // Step 2. photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Steps 3–6. details
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [customBrand, setCustomBrand] = useState(false);

  // Wear summarization
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  const modelOptions = details.brand ? modelsForBrand(details.brand) : [];
  const priceNum = Number(details.price);
  const priceTooLow = details.price !== "" && priceNum < MIN_NEW_PRICE;
  // The client does not know the seller's role, so it quotes the non-dealer
  // fee. The server recalculates from the real role before charging. A dealer
  // can therefore be quoted more than they are billed. Unchanged from before.
  const fee = getListingFeeDollars(priceNum, false);

  // ---- per-step validation -------------------------------------------------
  const identityValid = Boolean(
    details.brand.trim() && details.model.trim() && details.serialNumber.trim(),
  );
  const conditionValid = Boolean(details.description.trim());
  const priceValid = Number.isFinite(priceNum) && priceNum >= MIN_NEW_PRICE;
  const readyToSubmit = identityValid && conditionValid && priceValid;

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return Boolean(videoId) || videoUnavailable;
      case 2:
        return identityValid;
      case 4:
        return conditionValid;
      case 5:
        return priceValid;
      default:
        return true;
    }
  }

  // ---- uploads -------------------------------------------------------------
  async function handleVideo(file: File) {
    setError(null);
    setVideoUploading(true);
    setVideoProgress(0);
    try {
      const res = await fetch("/api/upload/video", { method: "POST" });
      const payload = (await res.json()) as {
        configured?: boolean;
        uploadURL?: string;
        videoId?: string;
        error?: string;
      };
      if (payload.configured === false) {
        setVideoUnavailable(true);
        setVideoUploading(false);
        return;
      }
      if (!res.ok || !payload.uploadURL || !payload.videoId) {
        throw new Error(payload.error ?? "Could not get upload URL");
      }
      const { uploadURL, videoId: id } = payload;

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
    const toUpload = Array.from(files).slice(0, 10 - photos.length);
    if (toUpload.length === 0) return;

    setPhotoUploading(true);
    try {
      for (const file of toUpload) {
        const res = await fetch("/api/upload/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: file.type, fileName: file.name }),
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

  // ---- AI wear summary -----------------------------------------------------
  async function summarize() {
    setSummarizing(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/listings/wear-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: details.brand,
          model: details.model,
          year: details.year ? Number(details.year) : null,
          condition: details.condition,
          wearAndTear: details.wearAndTear,
        }),
      });
      const data = (await res.json()) as { summary?: string; error?: string };
      if (!res.ok || !data.summary) {
        throw new Error(data.error ?? "Could not summarize");
      }
      set("wearSummary", data.summary);
    } catch (err) {
      setSummaryError(
        err instanceof Error ? err.message : "Could not summarize that.",
      );
    } finally {
      setSummarizing(false);
    }
  }

  // ---- submit --------------------------------------------------------------
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
          serialNumber: details.serialNumber.trim(),
          bodyShape: details.bodyShape || null,
          topWood: details.topWood || null,
          backSidesWood: details.backSidesWood || null,
          neckWood: details.neckWood || null,
          fretboardWood: details.fretboardWood || null,
          bracing: details.bracing || null,
          nutWidth: details.nutWidth || null,
          scaleLength: details.scaleLength || null,
          finish: details.finish.trim() || null,
          finishType: details.finishType || null,
          electronics: details.electronics || null,
          caseType: details.caseType || null,
          countryOfOrigin: details.countryOfOrigin || null,
          modifications: details.modifications.trim() || null,
          condition: details.condition,
          wearAndTear: details.wearAndTear.trim() || null,
          wearSummary: details.wearSummary.trim() || null,
          description: details.description.trim(),
          price: priceNum,
          city: details.city.trim() || null,
          state: details.state.trim() || null,
          videoId,
          photos,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url)
        throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not start checkout. Please try again.",
      );
      setSubmitting(false);
    }
  }

  const guitarName = guitarTitle(details) || "Your guitar";

  const specRows: [string, string][] = (
    [
      [
        "Condition",
        CONDITIONS.find((c) => c.value === details.condition)?.label ?? null,
      ],
      ["Body", details.bodyShape],
      ["Top", details.topWood],
      ["Back & sides", details.backSidesWood],
      ["Neck", details.neckWood],
      ["Fretboard", details.fretboardWood],
      ["Bracing", details.bracing],
      ["Nut width", details.nutWidth],
      ["Scale", details.scaleLength],
      [
        "Finish",
        [details.finish, details.finishType].filter(Boolean).join(" · ") ||
          null,
      ],
      ["Electronics", details.electronics],
      ["Case", details.caseType],
      ["Origin", details.countryOfOrigin],
    ] as [string, string | null][]
  ).filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-ink" : "bg-hairline"
              }`}
            />
          ))}
        </div>
        <p className="text-[12px] text-muted">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-card border border-match-border bg-match-bg px-4 py-2 text-[13px] text-match-text">
          {error}
        </p>
      )}

      {/* ---- STEP 1: VIDEO ---- */}
      {step === 0 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">
            Upload a walkthrough video
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            Every fret. listing requires a video. Show the front, back,
            headstock and any wear, then play a few bars. Up to 10 minutes.
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
              Video hosting isn&apos;t configured on this deployment, so the
              video requirement is waived for now. Set the Cloudflare Stream
              environment variables to turn it back on.
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
      )}

      {/* ---- STEP 2: PHOTOS ---- */}
      {step === 1 && (
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
                  onChange={(e) =>
                    e.target.files && handlePhotos(e.target.files)
                  }
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
      )}

      {/* ---- STEP 3: THE GUITAR ---- */}
      {step === 2 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">The guitar</h2>
          <p className="mt-2 text-[13px] text-muted">
            Serial number is required on every fret. listing. it&apos;s how
            buyers verify what they&apos;re looking at.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Field label="Brand" required>
              {customBrand ? (
                <div className="flex gap-2">
                  <input
                    className="fret-input"
                    value={details.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="Builder name"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBrand(false);
                      set("brand", "");
                      set("model", "");
                    }}
                    className="shrink-0 text-[12px] text-muted hover:text-ink"
                  >
                    List
                  </button>
                </div>
              ) : (
                <select
                  className="fret-input"
                  value={details.brand}
                  onChange={(e) => {
                    if (e.target.value === "__other__") {
                      setCustomBrand(true);
                      set("brand", "");
                    } else {
                      set("brand", e.target.value);
                    }
                    set("model", "");
                  }}
                >
                  <option value="">Select a brand…</option>
                  <optgroup label="Major">
                    {MAJOR_BRANDS.map((b) => (
                      <option key={b.slug} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Boutique">
                    {BOUTIQUE_BRANDS.map((b) => (
                      <option key={b.slug} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__other__">Other…</option>
                </select>
              )}
            </Field>

            <Field label="Model" required>
              {modelOptions.length > 0 ? (
                <select
                  className="fret-input"
                  value={details.model}
                  onChange={(e) => set("model", e.target.value)}
                >
                  <option value="">Select a model…</option>
                  {modelOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="fret-input"
                  value={details.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="D-18"
                />
              )}
            </Field>

            <Field label="Serial number" required>
              <input
                className="fret-input"
                value={details.serialNumber}
                onChange={(e) => set("serialNumber", e.target.value)}
                placeholder="e.g. 1234567"
              />
            </Field>

            <Field label="Year built">
              <input
                className="fret-input"
                value={details.year}
                onChange={(e) =>
                  set("year", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
                }
                placeholder="1968"
                inputMode="numeric"
              />
            </Field>

            <Select
              label="Body shape"
              value={details.bodyShape}
              onChange={(v) => set("bodyShape", v)}
              options={BODY_SHAPES}
              placeholder="Select a shape…"
            />

            <Select
              label="Country of origin"
              value={details.countryOfOrigin}
              onChange={(v) => set("countryOfOrigin", v)}
              options={COUNTRIES}
              placeholder="Select a country…"
            />
          </div>
        </div>
      )}

      {/* ---- STEP 4: BUILD SPECS ---- */}
      {step === 3 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">Build specs</h2>
          <p className="mt-2 text-[13px] text-muted">
            Everything you know. Buyers at this level care about woods, bracing
            and scale. leave blank anything you can&apos;t confirm.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Select
              label="Top wood"
              value={details.topWood}
              onChange={(v) => set("topWood", v)}
              options={TOP_WOODS}
              placeholder="Select a top…"
            />
            <Select
              label="Back & sides"
              value={details.backSidesWood}
              onChange={(v) => set("backSidesWood", v)}
              options={BACK_SIDES_WOODS}
              placeholder="Select back & sides…"
            />
            <Select
              label="Neck wood"
              value={details.neckWood}
              onChange={(v) => set("neckWood", v)}
              options={NECK_WOODS}
              placeholder="Select a neck…"
            />
            <Select
              label="Fretboard"
              value={details.fretboardWood}
              onChange={(v) => set("fretboardWood", v)}
              options={FRETBOARD_WOODS}
              placeholder="Select a fretboard…"
            />
            <Select
              label="Bracing"
              value={details.bracing}
              onChange={(v) => set("bracing", v)}
              options={BRACING_PATTERNS}
              placeholder="Select bracing…"
            />
            <Select
              label="Nut width"
              value={details.nutWidth}
              onChange={(v) => set("nutWidth", v)}
              options={NUT_WIDTHS}
              placeholder="Select nut width…"
            />
            <Select
              label="Scale length"
              value={details.scaleLength}
              onChange={(v) => set("scaleLength", v)}
              options={SCALE_LENGTHS}
              placeholder="Select scale length…"
            />
            <Field label="Finish colour">
              <input
                className="fret-input"
                value={details.finish}
                onChange={(e) => set("finish", e.target.value)}
                placeholder="Natural, sunburst…"
              />
            </Field>
            <Select
              label="Finish type"
              value={details.finishType}
              onChange={(v) => set("finishType", v)}
              options={FINISH_TYPES}
              placeholder="Select a finish…"
            />
            <Select
              label="Electronics"
              value={details.electronics}
              onChange={(v) => set("electronics", v)}
              options={ELECTRONICS}
              placeholder="Select electronics…"
            />
            <Select
              label="Case"
              value={details.caseType}
              onChange={(v) => set("caseType", v)}
              options={CASE_TYPES}
              placeholder="Select a case…"
            />
          </div>

          <div className="mt-4">
            <Field label="Modifications from stock">
              <textarea
                className="fret-input resize-none"
                rows={3}
                value={details.modifications}
                onChange={(e) => set("modifications", e.target.value)}
                placeholder="Saddle, nut, tuners, pickup install, refret… leave blank if all original."
              />
            </Field>
          </div>
        </div>
      )}

      {/* ---- STEP 5: CONDITION & WEAR ---- */}
      {step === 4 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">Condition</h2>
          <p className="mt-2 text-[13px] text-muted">
            Describe the wear honestly and in full. We&apos;ll condense it into
            a short summary for buyers. your original text is kept and shown
            alongside it.
          </p>

          <div className="mt-6 max-w-[240px]">
            <Select
              label="Condition grade"
              value={details.condition}
              onChange={(v) => set("condition", v)}
              options={CONDITIONS.map((c) => c.label)}
              values={CONDITIONS.map((c) => c.value)}
              placeholder="Select a grade…"
              required
            />
          </div>

          <div className="mt-4">
            <Field label="Wear, damage, repairs and history">
              <textarea
                className="fret-input resize-none"
                rows={6}
                value={details.wearAndTear}
                onChange={(e) => set("wearAndTear", e.target.value)}
                placeholder="Every scratch, ding, buckle rash, finish check, crack, brace lift or repair. where it is, how big, when it happened, who did the work. Be exhaustive; buyers at this level will find it anyway."
              />
            </Field>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={summarize}
                disabled={summarizing || details.wearAndTear.trim().length < 20}
                className="rounded-md border border-hairline bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-ink disabled:opacity-40"
              >
                {summarizing ? "Summarizing…" : "Summarize with AI"}
              </button>
              <span className="text-[11px] text-muted">
                {details.wearAndTear.trim().length < 20
                  ? "Write a little more first"
                  : "You can edit the summary afterward"}
              </span>
            </div>
            {summaryError && (
              <p className="mt-2 text-[12px] text-match-text">{summaryError}</p>
            )}
          </div>

          {details.wearSummary && (
            <div className="mt-4 rounded-card border border-match-border bg-match-bg p-4">
              <p className="mb-2 text-[11px] uppercase tracking-wide text-match-text">
                Buyer-facing summary
              </p>
              <textarea
                className="w-full resize-none border-0 bg-transparent text-[14px] leading-relaxed text-ink focus:outline-none"
                rows={4}
                value={details.wearSummary}
                onChange={(e) => set("wearSummary", e.target.value)}
              />
            </div>
          )}

          <div className="mt-4">
            <Field label="Description" required>
              <textarea
                className="fret-input resize-none"
                rows={5}
                value={details.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="How it sounds and plays, its history, why you're selling…"
              />
            </Field>
          </div>
        </div>
      )}

      {/* ---- STEP 6: PRICE ---- */}
      {step === 5 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">
            Price and location
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            fret. lists guitars from ${MIN_NEW_PRICE.toLocaleString("en-US")}{" "}
            up.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Field label="Asking price (USD)" required>
              <input
                className="fret-input"
                value={details.price}
                onChange={(e) =>
                  set("price", e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="4250"
                inputMode="numeric"
              />
              {priceTooLow && (
                <span className="mt-1 block text-[11px] text-match-text">
                  Minimum is ${MIN_NEW_PRICE.toLocaleString("en-US")}.
                </span>
              )}
            </Field>
            <div />
            <Field label="City">
              <input
                className="fret-input"
                value={details.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Asheville"
              />
            </Field>
            <Field label="State">
              <input
                className="fret-input"
                value={details.state}
                onChange={(e) => set("state", e.target.value)}
                placeholder="NC"
              />
            </Field>
          </div>
        </div>
      )}

      {/* ---- STEP 7: REVIEW ---- */}
      {step === 6 && (
        <div className="animate-fadeUp">
          <h2 className="font-serif text-[24px] text-ink">Review &amp; pay</h2>

          <div className="mt-6 rounded-card border-[0.5px] border-hairline bg-white p-5">
            <p className="font-serif text-[20px] text-ink">{guitarName}</p>
            <p className="mt-1 text-[13px] text-muted">
              Serial {details.serialNumber || " - "}
            </p>
            <p className="mt-3 text-[18px] font-medium text-ink">
              {formatPrice(priceNum || 0)}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t-[0.5px] border-hairline pt-4">
              {specRows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted">
                    {label}
                  </dt>
                  <dd className="text-[13px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            {details.wearSummary && (
              <div className="mt-4 border-t-[0.5px] border-hairline pt-4">
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  Wear summary
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink">
                  {details.wearSummary}
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-4 border-t-[0.5px] border-hairline pt-4 text-[12px] text-muted">
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
                {isPremiumPrice(priceNum) ? "Premium" : "Standard"} tier,
                one-time
              </p>
            </div>
            <p className="font-serif text-[22px] text-ink">${fee}</p>
          </div>
        </div>
      )}

      {/* ---- NAV ---- */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="text-[13px] text-muted hover:text-ink disabled:opacity-40"
        >
          Back
        </button>

        {step === STEPS.length - 1 ? (
          <Button onClick={submit} disabled={submitting || !readyToSubmit}>
            {submitting ? "Starting checkout…" : `Pay $${fee} & publish`}
          </Button>
        ) : (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

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
        {required && <span className="text-action"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  values,
  placeholder = "Select…",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  /** Optional parallel array of stored values, when they differ from labels. */
  values?: readonly string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} required={required}>
      <select
        className="fret-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={opt} value={values ? values[i] : opt}>
            {opt}
          </option>
        ))}
      </select>
    </Field>
  );
}
