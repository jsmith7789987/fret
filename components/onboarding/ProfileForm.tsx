"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceInput } from "./VoiceInput";
import { BrandPicker } from "./BrandPicker";
import { ModelPicker } from "./ModelPicker";
import { MultiSelect } from "./MultiSelect";
import { GuitarList } from "./GuitarList";
import { EMPTY_GUITAR, type GuitarSpec } from "./GuitarEntry";
import { Button } from "../ui/Button";
import {
  BODY_SHAPES,
  TOP_WOODS,
  BACK_SIDES_WOODS,
  MIN_NEW_PRICE,
} from "@/lib/guitars";

const STEPS = [
  "brands",
  "models",
  "shapes",
  "woods",
  "owned",
  "chasing",
  "dream",
  "spend",
] as const;

type Step = (typeof STEPS)[number];

const HEADINGS: Record<Step, { title: string; sub: string }> = {
  brands: {
    title: "Which builders do you gravitate toward?",
    sub: "Pick as many as you like. Acoustic only, and nothing that sold under $3,000 new.",
  },
  models: {
    title: "Any particular models?",
    sub: "Narrow it down if you have specifics in mind. Skip if you're open.",
  },
  shapes: {
    title: "What body shapes suit you?",
    sub: "The shape usually matters more than the badge on the headstock.",
  },
  woods: {
    title: "Any tonewood preferences?",
    sub: "Tops and back-and-sides. Skip if you'd rather judge by ear.",
  },
  owned: {
    title: "What do you currently own?",
    sub: "The more detail here, the better we can read what you reach for.",
  },
  chasing: {
    title: "What are you chasing next?",
    sub: "Add the guitars you're actively hunting. Specs can be partial.",
  },
  dream: {
    title: "Tell me about your dream guitar.",
    sub: "The one you'd buy without thinking twice.",
  },
  spend: {
    title:
      "If the right guitar appeared tomorrow, what's the most you'd spend?",
    sub: `Everything on fret. starts at $${MIN_NEW_PRICE.toLocaleString("en-US")}.`,
  },
};

export function ProfileForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoted, setPromoted] = useState<string[]>([]);

  // Answers
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [bodyShapes, setBodyShapes] = useState<string[]>([]);
  const [topWoods, setTopWoods] = useState<string[]>([]);
  const [backSidesWoods, setBackSidesWoods] = useState<string[]>([]);
  const [owned, setOwned] = useState<GuitarSpec[]>([{ ...EMPTY_GUITAR }]);
  const [chasing, setChasing] = useState<GuitarSpec[]>([{ ...EMPTY_GUITAR }]);
  const [dreamGuitar, setDreamGuitar] = useState("");
  const [maxSpend, setMaxSpend] = useState("");

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  // Load community brands that have crossed the promotion threshold.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { promoted?: string[] } | null) => {
        if (!cancelled && data?.promoted) setPromoted(data.promoted);
      })
      .catch(() => {
        /* static catalog is enough */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function buildOnboardingText(): string {
    const describe = (list: GuitarSpec[]) =>
      list
        .filter((g) => g.brand || g.model)
        .map((g) => {
          const parts = [
            [g.yearBuilt, g.brand, g.model].filter(Boolean).join(" "),
            g.bodyShape && `body: ${g.bodyShape}`,
            g.topWood && `top: ${g.topWood}`,
            g.backSidesWood && `back/sides: ${g.backSidesWood}`,
            g.serialNumber && `serial: ${g.serialNumber}`,
            g.description && `notes: ${g.description}`,
          ].filter(Boolean);
          return `- ${parts.join("; ")}`;
        })
        .join("\n");

    const sections: string[] = [
      `Preferred builders:\n${brands.join(", ") || "(open)"}`,
      `Models of interest:\n${models.join(", ") || "(open)"}`,
      `Preferred body shapes:\n${bodyShapes.join(", ") || "(open)"}`,
      `Preferred top woods:\n${topWoods.join(", ") || "(open)"}`,
      `Preferred back/sides woods:\n${backSidesWoods.join(", ") || "(open)"}`,
      `Currently owns:\n${describe(owned) || "(none listed)"}`,
      `Actively chasing:\n${describe(chasing) || "(none listed)"}`,
      `Dream guitar:\n${dreamGuitar.trim() || "(not specified)"}`,
      `Maximum spend:\n${maxSpend ? `$${maxSpend}` : "(not specified)"}`,
    ];

    return sections.join("\n\n");
  }

  async function submit() {
    setSubmitting(true);
    setError(null);

    const toPayload = (list: GuitarSpec[]) =>
      list
        .filter((g) => g.brand || g.model)
        .map((g) => ({
          brand: g.brand.trim(),
          model: g.model.trim() || null,
          bodyShape: g.bodyShape || null,
          topWood: g.topWood || null,
          backSidesWood: g.backSidesWood || null,
          yearBuilt: g.yearBuilt ? Number(g.yearBuilt) : null,
          serialNumber: g.serialNumber.trim() || null,
          description: g.description.trim() || null,
        }));

    try {
      const res = await fetch("/api/profile/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingText: buildOnboardingText(),
          structured: {
            brands,
            models,
            bodyShapes,
            topWoods,
            backSidesWoods,
            maxSpend: maxSpend ? Number(maxSpend) : null,
            owned: toPayload(owned),
            chasing: toPayload(chasing),
          },
        }),
      });
      if (!res.ok) throw new Error("Extraction failed");
      router.push("/browse");
      router.refresh();
    } catch {
      setError("Something went wrong building your profile. Try again.");
      setSubmitting(false);
    }
  }

  function next() {
    if (isLast) void submit();
    else setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  // Only the final question is required. everything else can be skipped.
  const canAdvance = !isLast || maxSpend.trim() !== "";
  const heading = HEADINGS[step];

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress */}
      <div className="mb-10 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-ink" : "bg-hairline"
            }`}
          />
        ))}
      </div>

      <div key={step} className="animate-fadeUp">
        <p className="mb-1 text-[12px] uppercase tracking-wide text-muted">
          {stepIndex + 1} of {STEPS.length}
        </p>
        <h2 className="font-serif text-[28px] leading-tight text-ink">
          {heading.title}
        </h2>
        <p className="mb-6 mt-1.5 text-[13px] text-muted">{heading.sub}</p>

        {step === "brands" && (
          <BrandPicker
            selected={brands}
            onChange={setBrands}
            promoted={promoted}
          />
        )}

        {step === "models" && (
          <ModelPicker brands={brands} selected={models} onChange={setModels} />
        )}

        {step === "shapes" && (
          <MultiSelect
            options={BODY_SHAPES}
            selected={bodyShapes}
            onChange={setBodyShapes}
          />
        )}

        {step === "woods" && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[12px] uppercase tracking-wide text-muted">
                Tops
              </p>
              <MultiSelect
                options={TOP_WOODS}
                selected={topWoods}
                onChange={setTopWoods}
              />
            </div>
            <div>
              <p className="mb-2 text-[12px] uppercase tracking-wide text-muted">
                Back &amp; sides
              </p>
              <MultiSelect
                options={BACK_SIDES_WOODS}
                selected={backSidesWoods}
                onChange={setBackSidesWoods}
              />
            </div>
          </div>
        )}

        {step === "owned" && (
          <GuitarList
            guitars={owned}
            onChange={setOwned}
            emptyLabel="Add a guitar you own"
          />
        )}

        {step === "chasing" && (
          <GuitarList
            guitars={chasing}
            onChange={setChasing}
            emptyLabel="Add a guitar you're chasing"
          />
        )}

        {step === "dream" && (
          <VoiceInput
            value={dreamGuitar}
            onChange={setDreamGuitar}
            placeholder="A pre-war herringbone, or a Collings OM in Brazilian…"
            autoFocus
          />
        )}

        {step === "spend" && (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-[28px] text-muted">$</span>
              <input
                className="fret-input max-w-[200px] text-[18px]"
                value={maxSpend}
                onChange={(e) =>
                  setMaxSpend(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="8000"
                inputMode="numeric"
                autoFocus
              />
            </div>
            {maxSpend !== "" && Number(maxSpend) < MIN_NEW_PRICE && (
              <p className="mt-3 rounded-card border border-amber-border bg-amber-bg px-4 py-2 text-[12px] text-amber-text">
                Heads up. fret. inventory starts around $
                {MIN_NEW_PRICE.toLocaleString("en-US")}. We&apos;ll still show
                you what we can.
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-[13px] text-amber-text">{error}</p>}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0 || submitting}
          className="text-[13px] text-muted hover:text-ink disabled:opacity-40"
        >
          Back
        </button>

        <div className="flex items-center gap-3">
          {!isLast && (
            <button
              type="button"
              onClick={next}
              className="text-[13px] text-muted hover:text-ink"
            >
              Skip
            </button>
          )}
          <Button onClick={next} disabled={submitting || !canAdvance}>
            {submitting
              ? "Building your profile…"
              : isLast
                ? "Finish"
                : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
