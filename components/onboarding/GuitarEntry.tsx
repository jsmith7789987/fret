"use client";

import { useState } from "react";
import {
  MAJOR_BRANDS,
  BOUTIQUE_BRANDS,
  BODY_SHAPES,
  TOP_WOODS,
  BACK_SIDES_WOODS,
  modelsForBrand,
} from "@/lib/guitars";
import { guitarTitle } from "@/lib/format";
import { Field } from "@/components/ui/Field";

export interface GuitarSpec {
  brand: string;
  model: string;
  bodyShape: string;
  topWood: string;
  backSidesWood: string;
  yearBuilt: string;
  serialNumber: string;
  description: string;
}

export const EMPTY_GUITAR: GuitarSpec = {
  brand: "",
  model: "",
  bodyShape: "",
  topWood: "",
  backSidesWood: "",
  yearBuilt: "",
  serialNumber: "",
  description: "",
};

export function guitarLabel(g: GuitarSpec): string {
  return (
    guitarTitle({ year: g.yearBuilt, brand: g.brand, model: g.model }) ||
    "Guitar"
  );
}

/**
 * Full spec capture for one guitar. Brand drives the model list. major brands
 * expose their $3,000+ model lines, boutique builders expose the body styles
 * they build, and a write-in brand falls back to the standard shape list.
 */
export function GuitarEntry({
  value,
  onChange,
  onRemove,
}: {
  value: GuitarSpec;
  onChange: (next: GuitarSpec) => void;
  onRemove?: () => void;
}) {
  const [customBrand, setCustomBrand] = useState(
    Boolean(value.brand) && !isKnownBrand(value.brand),
  );

  function set<K extends keyof GuitarSpec>(key: K, v: GuitarSpec[K]) {
    // Changing brand invalidates the model choice.
    if (key === "brand") {
      onChange({ ...value, brand: v as string, model: "" });
      return;
    }
    onChange({ ...value, [key]: v });
  }

  const modelOptions = value.brand ? modelsForBrand(value.brand) : [];

  return (
    <div className="rounded-card border-[0.5px] border-hairline bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-serif text-[16px] text-ink">{guitarLabel(value)}</p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[12px] text-muted hover:text-ink"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Brand */}
        <Field label="Brand">
          {customBrand ? (
            <div className="flex gap-2">
              <input
                className="fret-input"
                value={value.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Builder name"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomBrand(false);
                  set("brand", "");
                }}
                className="shrink-0 text-[12px] text-muted hover:text-ink"
              >
                List
              </button>
            </div>
          ) : (
            <select
              className="fret-input"
              value={value.brand}
              onChange={(e) => {
                if (e.target.value === "__other__") {
                  setCustomBrand(true);
                  set("brand", "");
                } else {
                  set("brand", e.target.value);
                }
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

        {/* Model */}
        <Field label="Model">
          {modelOptions.length > 0 ? (
            <select
              className="fret-input"
              value={value.model}
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
              value={value.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Model"
            />
          )}
        </Field>

        {/* Body shape */}
        <Field label="Body shape">
          <select
            className="fret-input"
            value={value.bodyShape}
            onChange={(e) => set("bodyShape", e.target.value)}
          >
            <option value="">Select a shape…</option>
            {BODY_SHAPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        {/* Year built */}
        <Field label="Year built">
          <input
            className="fret-input"
            value={value.yearBuilt}
            onChange={(e) =>
              set(
                "yearBuilt",
                e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
              )
            }
            placeholder="1968"
            inputMode="numeric"
          />
        </Field>

        {/* Top wood */}
        <Field label="Top wood">
          <select
            className="fret-input"
            value={value.topWood}
            onChange={(e) => set("topWood", e.target.value)}
          >
            <option value="">Select a top…</option>
            {TOP_WOODS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>

        {/* Back / sides wood */}
        <Field label="Back & sides">
          <select
            className="fret-input"
            value={value.backSidesWood}
            onChange={(e) => set("backSidesWood", e.target.value)}
          >
            <option value="">Select back & sides…</option>
            {BACK_SIDES_WOODS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>

        {/* Serial number */}
        <Field label="Serial number" className="col-span-2">
          <input
            className="fret-input"
            value={value.serialNumber}
            onChange={(e) => set("serialNumber", e.target.value)}
            placeholder="e.g. 234567"
          />
        </Field>
      </div>

      {/* Description */}
      <div className="mt-3">
        <Field label="Description">
          <textarea
            className="fret-input resize-none"
            rows={3}
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="How it sounds, how you use it, any history or work done…"
          />
        </Field>
      </div>
    </div>
  );
}

function isKnownBrand(name: string): boolean {
  const lower = name.toLowerCase();
  return [...MAJOR_BRANDS, ...BOUTIQUE_BRANDS].some(
    (b) => b.name.toLowerCase() === lower,
  );
}
