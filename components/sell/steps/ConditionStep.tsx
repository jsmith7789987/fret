"use client";

import { Field, Select } from "@/components/ui/Field";
import { CONDITIONS } from "@/lib/format";
import type { ListingDraft, SetDraftField } from "../draft";

export function ConditionStep({
  details,
  set,
  summarizing,
  summaryError,
  summarize,
}: {
  details: ListingDraft;
  set: SetDraftField;
  summarizing: boolean;
  summaryError: string | null;
  summarize: () => void;
}) {
  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-[24px] text-ink">Condition</h2>
      <p className="mt-2 text-[13px] text-muted">
        Describe the wear honestly and in full. We&apos;ll condense it into a
        short summary for buyers. your original text is kept and shown alongside
        it.
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
  );
}
