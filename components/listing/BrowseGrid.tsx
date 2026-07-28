"use client";

import { useMemo, useState } from "react";
import { Chip } from "../ui/Chip";
import { ListingGrid } from "./ListingGrid";
import type { ListingCardData } from "./ListingCard";

const VINTAGE_BEFORE = 1990;

type Filter =
  | { kind: "all" }
  | { kind: "brand"; value: string }
  | { kind: "vintage" }
  | { kind: "under" }
  | { kind: "video" };

export function BrowseGrid({ listings }: { listings: ListingCardData[] }) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });

  const brands = useMemo(() => {
    const set = new Set(listings.map((l) => l.brand));
    return Array.from(set).sort();
  }, [listings]);

  const filtered = useMemo(() => {
    switch (filter.kind) {
      case "brand":
        return listings.filter((l) => l.brand === filter.value);
      case "vintage":
        return listings.filter(
          (l) => l.year != null && l.year < VINTAGE_BEFORE,
        );
      case "under":
        return listings.filter((l) => l.price < 2500);
      case "video":
        return listings.filter((l) => Boolean(l.videoId));
      default:
        return listings;
    }
  }, [listings, filter]);

  const isActive = (f: Filter) => {
    if (f.kind !== filter.kind) return false;
    if (f.kind === "brand" && filter.kind === "brand")
      return f.value === filter.value;
    return true;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip
          active={isActive({ kind: "all" })}
          onClick={() => setFilter({ kind: "all" })}
        >
          All
        </Chip>
        {brands.map((brand) => (
          <Chip
            key={brand}
            active={isActive({ kind: "brand", value: brand })}
            onClick={() => setFilter({ kind: "brand", value: brand })}
          >
            {brand}
          </Chip>
        ))}
        <Chip
          active={isActive({ kind: "vintage" })}
          onClick={() => setFilter({ kind: "vintage" })}
        >
          Vintage
        </Chip>
        <Chip
          active={isActive({ kind: "under" })}
          onClick={() => setFilter({ kind: "under" })}
        >
          Under $2,500
        </Chip>
        <Chip
          active={isActive({ kind: "video" })}
          onClick={() => setFilter({ kind: "video" })}
        >
          With video
        </Chip>
      </div>

      <ListingGrid listings={filtered} />
    </div>
  );
}
