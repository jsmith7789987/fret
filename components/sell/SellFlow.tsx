"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { CONDITIONS, guitarTitle } from "@/lib/format";
import { getListingFeeDollars } from "@/lib/pricing";
import { MIN_NEW_PRICE, modelsForBrand } from "@/lib/guitars";
import {
  EMPTY_DRAFT,
  SELL_STEPS,
  type ListingDraft,
  type SetDraftField,
} from "./draft";
import { VideoStep } from "./steps/VideoStep";
import { PhotosStep } from "./steps/PhotosStep";
import { GuitarStep } from "./steps/GuitarStep";
import { BuildSpecsStep } from "./steps/BuildSpecsStep";
import { ConditionStep } from "./steps/ConditionStep";
import { PriceStep } from "./steps/PriceStep";
import { ReviewStep } from "./steps/ReviewStep";

/**
 * The seller listing flow.
 *
 * This component owns the draft and the network calls. Each step renders from
 * its own file in ./steps, so no single file holds every screen.
 */
export function SellFlow() {
  const [step, setStep] = useState(0);

  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  // Set when this deployment has no video hosting configured. The video
  // requirement is waived so the rest of the flow stays walkable.
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [details, setDetails] = useState<ListingDraft>(EMPTY_DRAFT);
  const [customBrand, setCustomBrand] = useState(false);

  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set: SetDraftField = (key, value) =>
    setDetails((previous) => ({ ...previous, [key]: value }));

  const modelOptions = details.brand ? modelsForBrand(details.brand) : [];
  const priceNum = Number(details.price);
  const priceTooLow = details.price !== "" && priceNum < MIN_NEW_PRICE;

  // The client does not know the seller's role, so it quotes the non-dealer
  // fee. The server recalculates from the real role before charging.
  const fee = getListingFeeDollars(priceNum, false);

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

  async function handleVideo(file: File) {
    setError(null);
    setVideoUploading(true);
    setVideoProgress(0);
    try {
      const response = await fetch("/api/upload/video", { method: "POST" });
      const payload = (await response.json()) as {
        configured?: boolean;
        uploadURL?: string;
        videoId?: string;
        error?: string;
      };

      if (payload.configured === false) {
        setVideoUnavailable(true);
        return;
      }
      if (!response.ok || !payload.uploadURL || !payload.videoId) {
        throw new Error(payload.error ?? "Could not get upload URL");
      }

      await uploadWithProgress(payload.uploadURL, file, setVideoProgress);
      setVideoId(payload.videoId);
      setVideoProgress(100);
    } catch (err) {
      console.error("[sell] Video upload failed:", err);
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
        const publicUrl = await uploadPhoto(file);
        setPhotos((previous) => [...previous, publicUrl]);
      }
    } catch (err) {
      console.error("[sell] Photo upload failed:", err);
      setError("One or more photos failed to upload.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function summarize() {
    setSummarizing(true);
    setSummaryError(null);
    try {
      const response = await fetch("/api/listings/wear-summary", {
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
      const data = (await response.json()) as {
        summary?: string;
        error?: string;
      };
      if (!response.ok || !data.summary) {
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

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toListingPayload(details, videoId, photos)),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("[sell] Checkout failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not start checkout. Please try again.",
      );
      setSubmitting(false);
    }
  }

  const guitarName = guitarTitle(details) || "Your guitar";
  const specRows = buildSpecRows(details);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-1.5">
          {SELL_STEPS.map((label, index) => (
            <span
              key={label}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= step ? "bg-ink" : "bg-hairline"
              }`}
            />
          ))}
        </div>
        <p className="text-[12px] text-muted">
          Step {step + 1} of {SELL_STEPS.length} · {SELL_STEPS[step]}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-card border border-match-border bg-match-bg px-4 py-2 text-[13px] text-match-text">
          {error}
        </p>
      )}

      {step === 0 && (
        <VideoStep
          videoId={videoId}
          videoUploading={videoUploading}
          videoProgress={videoProgress}
          videoUnavailable={videoUnavailable}
          handleVideo={handleVideo}
        />
      )}
      {step === 1 && (
        <PhotosStep
          photos={photos}
          photoUploading={photoUploading}
          handlePhotos={handlePhotos}
          setPhotos={setPhotos}
        />
      )}
      {step === 2 && (
        <GuitarStep
          details={details}
          set={set}
          customBrand={customBrand}
          setCustomBrand={setCustomBrand}
          modelOptions={modelOptions}
        />
      )}
      {step === 3 && <BuildSpecsStep details={details} set={set} />}
      {step === 4 && (
        <ConditionStep
          details={details}
          set={set}
          summarizing={summarizing}
          summaryError={summaryError}
          summarize={summarize}
        />
      )}
      {step === 5 && (
        <PriceStep details={details} set={set} priceTooLow={priceTooLow} />
      )}
      {step === 6 && (
        <ReviewStep
          details={details}
          guitarName={guitarName}
          specRows={specRows}
          videoId={videoId}
          photos={photos}
          priceNum={priceNum}
          fee={fee}
        />
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || submitting}
          className="text-[13px] text-muted hover:text-action disabled:opacity-40"
        >
          Back
        </button>

        {step === SELL_STEPS.length - 1 ? (
          <Button onClick={submit} disabled={submitting || !readyToSubmit}>
            {submitting ? "Starting checkout…" : `Pay $${fee} and publish`}
          </Button>
        ) : (
          <Button
            onClick={() => setStep((current) => current + 1)}
            disabled={!canAdvance()}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

/** Upload one file to a direct upload URL, reporting progress as it goes. */
function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error("Upload failed"));
    request.onerror = () => reject(new Error("Upload failed"));

    const form = new FormData();
    form.append("file", file);
    request.send(form);
  });
}

/** Get a presigned URL, PUT the file to it, and return its public URL. */
async function uploadPhoto(file: File): Promise<string> {
  const response = await fetch("/api/upload/photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, fileName: file.name }),
  });
  if (!response.ok) throw new Error("Could not get upload URL");

  const { uploadUrl, publicUrl } = (await response.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error("Upload failed");

  return publicUrl;
}

function toListingPayload(
  details: ListingDraft,
  videoId: string | null,
  photos: string[],
) {
  return {
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
    price: Number(details.price),
    city: details.city.trim() || null,
    state: details.state.trim() || null,
    videoId,
    photos,
  };
}

/** The specification rows shown on the review step, blanks omitted. */
function buildSpecRows(details: ListingDraft): [string, string][] {
  const rows: [string, string | null][] = [
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
      [details.finish, details.finishType].filter(Boolean).join(" · ") || null,
    ],
    ["Electronics", details.electronics],
    ["Case", details.caseType],
    ["Origin", details.countryOfOrigin],
  ];
  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}
