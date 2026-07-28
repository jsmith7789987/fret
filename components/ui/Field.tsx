import type { ReactNode } from "react";

/** A labelled form control. Used by the seller flow and buyer onboarding. */
export function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[12px] font-medium text-muted">
        {label}
        {required && <span className="text-action"> *</span>}
      </span>
      {children}
    </label>
  );
}

/** A labelled dropdown built on Field. */
export function Select({
  label,
  value,
  onChange,
  options,
  values,
  placeholder = "Select…",
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  /** Stored values, when they differ from the labels shown. */
  values?: readonly string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <Field label={label} required={required} className={className}>
      <select
        className="fret-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={option} value={values ? values[index] : option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}
