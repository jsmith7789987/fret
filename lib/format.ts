import type { Condition } from "@prisma/client";

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

const CONDITION_LABELS: Record<Condition, string> = {
  MINT: "Mint",
  EXCELLENT: "Excellent",
  VERY_GOOD_PLUS: "Very Good+",
  VERY_GOOD: "Very Good",
  GOOD: "Good",
  FAIR: "Fair",
};

export function formatCondition(condition: Condition): string {
  return CONDITION_LABELS[condition] ?? condition;
}

export const CONDITIONS: { value: Condition; label: string }[] = (
  Object.keys(CONDITION_LABELS) as Condition[]
).map((value) => ({ value, label: CONDITION_LABELS[value] }));

export function formatLocation(
  city?: string | null,
  state?: string | null
): string | null {
  const parts = [city, state].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function memberSince(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
