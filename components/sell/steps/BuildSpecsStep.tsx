"use client";

import { Field, Select } from "@/components/ui/Field";
import {
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
} from "@/lib/guitars";
import type { ListingDraft, SetDraftField } from "../draft";

export function BuildSpecsStep({
  details,
  set,
}: {
  details: ListingDraft;
  set: SetDraftField;
}) {
  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-[24px] text-ink">Build specs</h2>
      <p className="mt-2 text-[13px] text-muted">
        Everything you know. Buyers at this level care about woods, bracing and
        scale. leave blank anything you can&apos;t confirm.
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
  );
}
