"use client";

import { GuitarEntry, EMPTY_GUITAR, type GuitarSpec } from "./GuitarEntry";

export function GuitarList({
  guitars,
  onChange,
  addLabel = "Add another guitar",
  emptyLabel = "Add a guitar",
}: {
  guitars: GuitarSpec[];
  onChange: (next: GuitarSpec[]) => void;
  addLabel?: string;
  emptyLabel?: string;
}) {
  function update(index: number, next: GuitarSpec) {
    onChange(guitars.map((g, i) => (i === index ? next : g)));
  }

  function remove(index: number) {
    onChange(guitars.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {guitars.map((guitar, i) => (
        <GuitarEntry
          key={i}
          value={guitar}
          onChange={(next) => update(i, next)}
          onRemove={guitars.length > 1 ? () => remove(i) : undefined}
        />
      ))}

      <button
        type="button"
        onClick={() => onChange([...guitars, { ...EMPTY_GUITAR }])}
        className="w-full rounded-card border border-dashed border-hairline bg-white py-3 text-[13px] text-muted transition-colors hover:border-ink hover:text-ink"
      >
        + {guitars.length === 0 ? emptyLabel : addLabel}
      </button>
    </div>
  );
}
