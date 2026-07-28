"use client";

import {
  findBrand,
  modelsForBrand,
  BODY_SHAPES,
  MIN_NEW_PRICE,
} from "@/lib/guitars";

/**
 * For every brand the buyer picked, offer its models. Major brands get their
 * real model lines ($3,000+ new only); boutique builders get the body styles
 * they normally make; unrecognized write-ins fall back to standard shapes.
 *
 * Values are namespaced "Brand. Model" so selections stay unambiguous.
 */
export function ModelPicker({
  brands,
  selected,
  onChange,
}: {
  brands: string[];
  selected: string[];
  onChange: (models: string[]) => void;
}) {
  if (brands.length === 0) {
    return (
      <p className="rounded-card border-[0.5px] border-hairline bg-white px-4 py-6 text-center text-[13px] text-muted">
        Pick a brand first and its models will show up here.
      </p>
    );
  }

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  }

  return (
    <div className="space-y-5">
      {brands.map((brandName) => {
        const brand = findBrand(brandName);
        const options = modelsForBrand(brandName);
        const isFallback = !brand;
        const label =
          brand?.tier === "BOUTIQUE"
            ? "Body styles they build"
            : isFallback
              ? "Standard body styles"
              : "Models";

        return (
          <div key={brandName}>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="font-serif text-[18px] text-ink">{brandName}</h3>
              <span className="text-[11px] uppercase tracking-wide text-muted">
                {label}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const value = `${brandName}. ${option}`;
                const active = selected.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggle(value)}
                    className={`rounded-[20px] border px-3 py-1 text-[12px] transition-colors ${
                      active
                        ? "border-ink bg-ink text-white"
                        : "border-hairline bg-white text-muted hover:border-ink hover:text-ink"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-[12px] text-muted">
        Nothing on fret. sold for under ${MIN_NEW_PRICE.toLocaleString("en-US")}{" "}
        new, so the entry-level lines aren&apos;t listed. Custom and one-off
        builds fall back to the {BODY_SHAPES.length} standard body styles.
      </p>
    </div>
  );
}
