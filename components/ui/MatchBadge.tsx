export function MatchBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center rounded-[20px] bg-match-bg px-2 py-0.5 text-[11px] font-medium text-match-text ring-1 ring-match-border">
      {score}% match
    </span>
  );
}
