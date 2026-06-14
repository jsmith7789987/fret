export function MatchBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center rounded-[20px] bg-amber-bg px-2 py-0.5 text-[11px] font-medium text-amber-text ring-1 ring-amber-border">
      {score}% match
    </span>
  );
}
