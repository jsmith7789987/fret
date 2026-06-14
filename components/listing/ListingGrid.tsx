import { ListingCard, type ListingCardData } from "./ListingCard";

export function ListingGrid({ listings }: { listings: ListingCardData[] }) {
  if (listings.length === 0) {
    return (
      <div className="rounded-card border-[0.5px] border-hairline bg-white px-6 py-16 text-center text-[13px] text-muted">
        No guitars match these filters yet.
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
    >
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
