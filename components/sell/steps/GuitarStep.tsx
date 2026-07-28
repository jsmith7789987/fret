"use client";

import { Field, Select } from "@/components/ui/Field";
import {
  MAJOR_BRANDS,
  BOUTIQUE_BRANDS,
  BODY_SHAPES,
  COUNTRIES,
} from "@/lib/guitars";
import type { ListingDraft, SetDraftField } from "../draft";

export function GuitarStep({
  details,
  set,
  customBrand,
  setCustomBrand,
  modelOptions,
}: {
  details: ListingDraft;
  set: SetDraftField;
  customBrand: boolean;
  setCustomBrand: (value: boolean) => void;
  modelOptions: string[];
}) {
  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-[24px] text-ink">The guitar</h2>
      <p className="mt-2 text-[13px] text-muted">
        Serial number is required on every fret. listing. it&apos;s how buyers
        verify what they&apos;re looking at.
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
  );
}
