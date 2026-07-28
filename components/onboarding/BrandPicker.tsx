"use client";

import { useMemo, useState } from "react";
import type { Brand } from "@/lib/guitars";
import { MAJOR_BRANDS, BOUTIQUE_BRANDS, prettyBrandName } from "@/lib/guitars";

/**
 * Brand selection: the six major luxury acoustic makers up top (alphabetical),
 * a "Boutique builds" drawer with the top 30 builders, and "Other" for a
 * write-in. Write-ins are reported to the server, which promotes any name that
 * reaches the threshold into the boutique list for everyone.
 */
export function BrandPicker({
  selected,
  onChange,
  promoted = [],
}: {
  selected: string[];
  onChange: (brands: string[]) => void;
  /** Community brands already promoted into the boutique list. */
  promoted?: string[];
}) {
  const [showBoutique, setShowBoutique] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const [writeIns, setWriteIns] = useState<string[]>([]);

  const boutique = useMemo<Brand[]>(() => {
    const promotedBrands: Brand[] = promoted
      .filter(
        (name) =>
          !BOUTIQUE_BRANDS.some(
            (b) => b.name.toLowerCase() === name.toLowerCase(),
          ),
      )
      .map((name) => ({
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        tier: "BOUTIQUE" as const,
        blurb: "Added by the fret. community",
      }));
    return [...BOUTIQUE_BRANDS, ...promotedBrands].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [promoted]);

  const isSelected = (name: string) =>
    selected.some((s) => s.toLowerCase() === name.toLowerCase());

  function toggle(name: string) {
    if (isSelected(name)) {
      onChange(selected.filter((s) => s.toLowerCase() !== name.toLowerCase()));
    } else {
      onChange([...selected, name]);
    }
  }

  async function addWriteIn() {
    const name = prettyBrandName(otherValue);
    if (!name) return;
    if (!isSelected(name)) onChange([...selected, name]);
    setWriteIns((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setOtherValue("");

    // Report it so it can be promoted once enough people list the same builder.
    try {
      await fetch("/api/brands/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } catch {
      // Non-critical. the selection still stands locally.
    }
  }

  return (
    <div>
      {/* Major brands. alphabetical */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MAJOR_BRANDS.map((brand) => (
          <BrandTile
            key={brand.slug}
            brand={brand}
            active={isSelected(brand.name)}
            onClick={() => toggle(brand.name)}
          />
        ))}
      </div>

      {/* Boutique drawer toggle */}
      <button
        type="button"
        onClick={() => setShowBoutique((v) => !v)}
        className={`mt-3 flex w-full items-center justify-between rounded-card border-[0.5px] px-4 py-3 text-left transition-colors ${
          showBoutique
            ? "border-ink bg-white"
            : "border-hairline bg-white hover:border-ink"
        }`}
      >
        <span>
          <span className="block text-[14px] font-medium text-ink">
            Boutique builds
          </span>
          <span className="block text-[12px] text-muted">
            {boutique.length} independent luthiers
          </span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-muted transition-transform ${
            showBoutique ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showBoutique && (
        <div className="mt-3 animate-fadeUp rounded-card border-[0.5px] border-hairline bg-white p-3">
          <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {boutique.map((brand) => (
              <button
                key={brand.slug}
                type="button"
                onClick={() => toggle(brand.name)}
                className={`rounded-md border px-3 py-2 text-left transition-colors ${
                  isSelected(brand.name)
                    ? "border-ink bg-ink text-white"
                    : "border-hairline hover:border-ink"
                }`}
              >
                <span className="block text-[13px] font-medium">
                  {brand.name}
                </span>
                <span
                  className={`block truncate text-[11px] ${
                    isSelected(brand.name) ? "text-white/70" : "text-muted"
                  }`}
                >
                  {brand.blurb}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Other / write-in */}
      <button
        type="button"
        onClick={() => setShowOther((v) => !v)}
        className="mt-3 w-full rounded-card border border-dashed border-hairline bg-white px-4 py-3 text-left text-[14px] text-muted transition-colors hover:border-ink hover:text-ink"
      >
        Other. name the builder
      </button>

      {showOther && (
        <div className="mt-3 animate-fadeUp">
          <div className="flex gap-2">
            <input
              className="fret-input"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addWriteIn();
                }
              }}
              placeholder="e.g. Bruce Sexauer"
            />
            <button
              type="button"
              onClick={() => void addWriteIn()}
              disabled={!otherValue.trim()}
              className="shrink-0 rounded-md bg-ink px-4 text-[13px] font-medium text-white disabled:opacity-40"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-[12px] text-muted">
            Write-ins join the boutique list once ten guitars from the same
            builder are on the site.
          </p>
        </div>
      )}

      {/* Selected summary */}
      {selected.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[12px] uppercase tracking-wide text-muted">
            Selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                className="inline-flex items-center gap-1.5 rounded-[20px] bg-ink px-3 py-1 text-[12px] text-white"
              >
                {name}
                {writeIns.includes(name) && (
                  <span className="text-amber-border">new</span>
                )}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BrandTile({
  brand,
  active,
  onClick,
}: {
  brand: Brand;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-card border-[0.5px] px-4 py-3 text-left transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-hairline bg-white hover:border-ink"
      }`}
    >
      <span className="block font-serif text-[17px] leading-tight">
        {brand.name}
      </span>
      <span
        className={`mt-0.5 block truncate text-[11px] ${
          active ? "text-white/70" : "text-muted"
        }`}
      >
        {brand.blurb}
      </span>
    </button>
  );
}
