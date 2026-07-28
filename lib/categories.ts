/**
 * Browse categories.
 *
 * Each one is a real filter, not decoration. The href drives the browse page,
 * so a category tile and a filter chip land a person in the same place.
 *
 * Counts are supplied by the caller from live inventory. Until a listing
 * exists the tiles render without a count rather than showing a fake number.
 */

export interface Category {
  slug: string;
  title: string;
  /** Short line used on the large featured tiles. */
  blurb: string;
  /** Query the browse page understands. */
  href: string;
  /**
   * Placeholder treatment used until a category has a real photograph.
   * Two stops of a CSS gradient, so nothing is fetched over the network.
   */
  gradient: [string, string];
}

/** The four large tiles on the home page. */
export const FEATURED_CATEGORIES: Category[] = [
  {
    slug: "dreadnought",
    title: "Dreadnought",
    blurb: "Volume and low end. The bluegrass and flatpicking standard.",
    href: "/browse?shape=Dreadnought",
    gradient: ["#3B2F26", "#7A6248"],
  },
  {
    slug: "om-000",
    title: "OM and 000",
    blurb: "Balanced and articulate. The fingerstyle player's body.",
    href: "/browse?shape=OM",
    gradient: ["#24303B", "#5A7183"],
  },
  {
    slug: "vintage",
    title: "Vintage",
    blurb: "Built before 1990. Pre-war herringbone through the golden era.",
    href: "/browse?era=vintage",
    gradient: ["#3A2A2A", "#8A6A5A"],
  },
  {
    slug: "boutique",
    title: "Boutique",
    blurb: "One luthier, one bench. Small shop and single maker builds.",
    href: "/browse?tier=boutique",
    gradient: ["#2B2B33", "#6E6E82"],
  },
];

/** The category row in the site header. */
export const HEADER_CATEGORIES: { label: string; href: string }[] = [
  { label: "All guitars", href: "/browse" },
  { label: "Dreadnought", href: "/browse?shape=Dreadnought" },
  { label: "OM", href: "/browse?shape=OM" },
  { label: "000", href: "/browse?shape=000" },
  { label: "00", href: "/browse?shape=00" },
  { label: "Parlor", href: "/browse?shape=Parlor" },
  { label: "Jumbo", href: "/browse?shape=Jumbo" },
  { label: "12-Fret", href: "/browse?shape=12-Fret" },
  { label: "Vintage", href: "/browse?era=vintage" },
  { label: "Boutique", href: "/browse?tier=boutique" },
];

/** Format a listing count for a tile. Returns null when there is nothing yet. */
export function formatCount(count: number | null | undefined): string | null {
  if (count == null || count < 1) return null;
  return `${count.toLocaleString("en-US")} ${count === 1 ? "listing" : "listings"}`;
}
