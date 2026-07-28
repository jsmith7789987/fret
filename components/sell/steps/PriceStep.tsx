"use client";

import { Field } from "@/components/ui/Field";
import { MIN_NEW_PRICE } from "@/lib/guitars";
import type { ListingDraft, SetDraftField } from "../draft";

export function PriceStep({
  details,
  set,
  priceTooLow,
}: {
  details: ListingDraft;
  set: SetDraftField;
  priceTooLow: boolean;
}) {
  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-[24px] text-ink">Price and location</h2>
      <p className="mt-2 text-[13px] text-muted">
        fret. lists guitars from ${MIN_NEW_PRICE.toLocaleString("en-US")} up.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Field label="Asking price (USD)" required>
          <input
            className="fret-input"
            value={details.price}
            onChange={(e) =>
              set("price", e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="4250"
            inputMode="numeric"
          />
          {priceTooLow && (
            <span className="mt-1 block text-[11px] text-match-text">
              Minimum is ${MIN_NEW_PRICE.toLocaleString("en-US")}.
            </span>
          )}
        </Field>
        <div />
        <Field label="City">
          <input
            className="fret-input"
            value={details.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Asheville"
          />
        </Field>
        <Field label="State">
          <input
            className="fret-input"
            value={details.state}
            onChange={(e) => set("state", e.target.value)}
            placeholder="NC"
          />
        </Field>
      </div>
    </div>
  );
}
