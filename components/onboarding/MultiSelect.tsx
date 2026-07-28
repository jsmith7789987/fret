"use client";

/** Chip-style multi-select used for body shape and tonewood preferences. */
export function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option],
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
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
  );
}
