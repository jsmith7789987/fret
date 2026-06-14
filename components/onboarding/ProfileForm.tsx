"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceInput } from "./VoiceInput";
import { Button } from "../ui/Button";

const QUESTIONS = [
  {
    key: "genres",
    prompt: "What genres or styles do you play?",
    placeholder: "Fingerstyle, bluegrass, a little jazz…",
  },
  {
    key: "brands",
    prompt: "Which brands do you gravitate toward?",
    placeholder: "Martin, Collings, old Gibsons…",
  },
  {
    key: "current",
    prompt: "What do you currently own?",
    placeholder: "A 2015 Martin D-18, a beater Yamaha…",
  },
  {
    key: "chasing",
    prompt: "What are you chasing next?",
    placeholder: "Something with more headroom, a smaller body…",
  },
  {
    key: "dream",
    prompt: "Tell me about your dream guitar.",
    placeholder: "A pre-war herringbone, or a Collings OM…",
  },
  {
    key: "spend",
    prompt: "If the right guitar appeared tomorrow, what's the most you'd spend?",
    placeholder: "$5,000",
  },
] as const;

export function ProfileForm({ initial }: { initial?: string[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    initial && initial.length === QUESTIONS.length
      ? initial
      : Array(QUESTIONS.length).fill("")
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLast = step === QUESTIONS.length - 1;
  const current = QUESTIONS[step];
  const currentAnswer = answers[step];

  function setAnswer(v: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = v;
      return next;
    });
  }

  async function submit() {
    setSubmitting(true);
    setError(null);

    const onboardingText = QUESTIONS.map(
      (q, i) => `${q.prompt}\n${answers[i].trim()}`
    ).join("\n\n");

    try {
      const res = await fetch("/api/profile/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingText }),
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
    if (isLast) {
      void submit();
    } else {
      setStep((s) => Math.min(s + 1, QUESTIONS.length - 1));
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Progress */}
      <div className="mb-10 flex items-center gap-1.5">
        {QUESTIONS.map((q, i) => (
          <span
            key={q.key}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-ink" : "bg-hairline"
            }`}
          />
        ))}
      </div>

      <div key={step} className="animate-fadeUp">
        <p className="mb-1 text-[12px] uppercase tracking-wide text-muted">
          {step + 1} of {QUESTIONS.length}
        </p>
        <h2 className="mb-6 font-serif text-[28px] leading-tight text-ink">
          {current.prompt}
        </h2>

        <VoiceInput
          value={currentAnswer}
          onChange={setAnswer}
          placeholder={current.placeholder}
          autoFocus
        />
      </div>

      {error && <p className="mt-4 text-[13px] text-amber-text">{error}</p>}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
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
          <Button
            onClick={next}
            disabled={submitting || (currentAnswer.trim() === "" && isLast)}
          >
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
