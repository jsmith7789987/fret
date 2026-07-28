/** The listing a seller is filling in, and the steps they move through. */

export const SELL_STEPS = [
  "Video",
  "Photos",
  "The guitar",
  "Build specs",
  "Condition",
  "Price",
  "Review and pay",
] as const;

export interface ListingDraft {
  // Identity
  brand: string;
  model: string;
  year: string;
  serialNumber: string;
  bodyShape: string;
  countryOfOrigin: string;
  // Build
  topWood: string;
  backSidesWood: string;
  neckWood: string;
  fretboardWood: string;
  bracing: string;
  nutWidth: string;
  scaleLength: string;
  finish: string;
  finishType: string;
  electronics: string;
  caseType: string;
  modifications: string;
  // Condition
  condition: string;
  wearAndTear: string;
  wearSummary: string;
  description: string;
  // Commercial
  price: string;
  city: string;
  state: string;
}

export const EMPTY_DRAFT: ListingDraft = {
  brand: "",
  model: "",
  year: "",
  serialNumber: "",
  bodyShape: "",
  countryOfOrigin: "United States",
  topWood: "",
  backSidesWood: "",
  neckWood: "",
  fretboardWood: "",
  bracing: "",
  nutWidth: "",
  scaleLength: "",
  finish: "",
  finishType: "",
  electronics: "",
  caseType: "",
  modifications: "",
  condition: "EXCELLENT",
  wearAndTear: "",
  wearSummary: "",
  description: "",
  price: "",
  city: "",
  state: "",
};

/** Updates one field on the draft. */
export type SetDraftField = <K extends keyof ListingDraft>(
  key: K,
  value: ListingDraft[K],
) => void;
