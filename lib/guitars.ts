/**
 * fret. guitar catalog
 *
 * Acoustic-only, luxury-only. The floor for the whole site is $3,000 new.
 * every model listed here is a guitar that sold new above that mark, so the
 * cheap end of each brand's line (Martin X/Road/15/16 series, Taylor Academy/
 * GS Mini/100–400 series, Gibson Studio/Generation, Bourgeois Touchstone,
 * Collings' Waterloo line) is deliberately absent.
 */

export const MIN_NEW_PRICE = 3000;

export type BrandTier = "MAJOR" | "BOUTIQUE";

export interface Brand {
  slug: string;
  name: string;
  tier: BrandTier;
  /** Short positioning line shown under the brand name. */
  blurb: string;
  /**
   * MAJOR brands: real model names, $3,000+ new.
   * BOUTIQUE builders: the body styles they're known for (see `shapes`).
   */
  models?: string[];
  /** For boutique builders, the kinds they normally make. */
  shapes?: string[];
}

// ---------------------------------------------------------------------------
// Standard body shapes, offered for "Other" and custom builders, and as the
// preference vocabulary throughout onboarding.
// ---------------------------------------------------------------------------

export const BODY_SHAPES = [
  "Parlor",
  "0 (Concert)",
  "00 (Grand Concert)",
  "000 (Auditorium)",
  "OM (Orchestra Model)",
  "Grand Concert",
  "Grand Auditorium",
  "Dreadnought",
  "Slope-Shoulder Dreadnought",
  "Small Jumbo",
  "Jumbo",
  "Grand Symphony",
  "Grand Orchestra",
  "12-Fret",
] as const;

// ---------------------------------------------------------------------------
// Tonewoods
// ---------------------------------------------------------------------------

export const TOP_WOODS = [
  "Sitka Spruce",
  "Torrefied Sitka Spruce",
  "Adirondack Red Spruce",
  "Engelmann Spruce",
  "European Spruce",
  "German Spruce",
  "Carpathian Spruce",
  "Italian Alpine Spruce",
  "Western Red Cedar",
  "Redwood",
  "Sinker Redwood",
  "Koa",
  "Mahogany",
  "Maple",
] as const;

export const BACK_SIDES_WOODS = [
  "East Indian Rosewood",
  "Brazilian Rosewood",
  "Madagascar Rosewood",
  "Guatemalan Rosewood",
  "Cocobolo",
  "Honduran Mahogany",
  "African Mahogany",
  "Sapele",
  "Figured Maple",
  "Koa",
  "Walnut",
  "Claro Walnut",
  "African Blackwood",
  "Tasmanian Blackwood",
  "Ziricote",
  "Ovangkol",
  "Granadillo",
  "Wenge",
  "Myrtlewood",
  "Cherry",
  "Sinker Redwood",
] as const;

// ---------------------------------------------------------------------------
// Build specification vocabularies
// ---------------------------------------------------------------------------

export const NECK_WOODS = [
  "Honduran Mahogany",
  "African Mahogany",
  "Spanish Cedar",
  "Maple",
  "Figured Maple",
  "Walnut",
  "Koa",
  "Rosewood",
] as const;

export const FRETBOARD_WOODS = [
  "Ebony",
  "Macassar Ebony",
  "East Indian Rosewood",
  "Brazilian Rosewood",
  "Madagascar Rosewood",
  "Granadillo",
  "Pau Ferro",
  "Maple",
  "Richlite",
] as const;

export const BRACING_PATTERNS = [
  "Scalloped X-Brace",
  "Forward-Shifted Scalloped X-Brace",
  "Non-Scalloped X-Brace",
  "Standard X-Brace",
  "Hybrid X-Brace",
  "Ladder Braced",
  "Fan Braced",
  "A-Frame X-Brace",
  "Double-X Brace",
  "Adirondack Bracing",
] as const;

export const NUT_WIDTHS = [
  '1 11/16"',
  '1 3/4"',
  '1 13/16"',
  '1 7/8"',
  '1 23/32"',
  '2"',
] as const;

export const SCALE_LENGTHS = [
  '24.9" (short scale)',
  '25.34"',
  '25.4" (long scale)',
  '25.5"',
  '24.75"',
  '26.375" (baritone)',
] as const;

export const FINISH_TYPES = [
  "Nitrocellulose Lacquer",
  "Thin Nitrocellulose",
  "Polyurethane",
  "Polyester",
  "French Polish (Shellac)",
  "Varnish",
  "Oil Finish",
  "Satin",
  "Aged / Relic",
] as const;

export const ELECTRONICS = [
  "None (fully acoustic)",
  "K&K Pure Mini",
  "LR Baggs Anthem",
  "LR Baggs Element",
  "LR Baggs iMix",
  "Fishman Matrix",
  "Fishman Aura",
  "Baggs M1 Soundhole",
  "Trance Audio",
  "Sunrise Soundhole",
  "Other / Custom",
] as const;

export const CASE_TYPES = [
  "Original Hardshell Case",
  "Original Ameritage Case",
  "Calton / Karura Flight Case",
  "Aftermarket Hardshell Case",
  "Gig Bag",
  "No Case",
] as const;

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Ireland",
  "Germany",
  "France",
  "Spain",
  "Japan",
  "Australia",
  "New Zealand",
  "Other",
] as const;

// ---------------------------------------------------------------------------
// MAJOR luxury brands. alphabetical
// ---------------------------------------------------------------------------

export const MAJOR_BRANDS: Brand[] = [
  {
    slug: "bourgeois",
    name: "Bourgeois",
    tier: "MAJOR",
    blurb: "Dana Bourgeois, Lewiston, Maine",
    models: [
      "Aged Tone Vintage D",
      "Aged Tone Vintage OM",
      "Aged Tone Slope D",
      "Country Boy",
      "Banjo Killer",
      "Slope D",
      "Vintage D",
      "Dreadnought",
      "OM",
      "OMC",
      "Vintage OM",
      "L-DBO",
      "DBO",
      "Small Jumbo",
      "00",
      "Piccolo Parlor",
      "The Championship",
      "Presentation Dreadnought",
      "Presentation OM",
      "Soloist",
      "Signature Series",
      "Custom",
    ],
  },
  {
    slug: "collings",
    name: "Collings",
    tier: "MAJOR",
    blurb: "Austin, Texas. Obsessive consistency",
    models: [
      "D1",
      "D1A",
      "D2H",
      "D2HA",
      "D3",
      "D1 Traditional",
      "D2H Traditional",
      "CW (Clarence White)",
      "CW Indian A",
      "OM1",
      "OM1A",
      "OM2H",
      "OM2HA",
      "OM3",
      "OM42",
      "OM1 Traditional",
      "OM2H Traditional",
      "001",
      "002H",
      "002HA",
      "003",
      "002H Traditional",
      "01",
      "02H",
      "03",
      "0002H",
      "0003",
      "CJ Mh",
      "CJ35",
      "CJ45",
      "SJ",
      "Baby 1",
      "Baby 2H",
      "Parlor 1",
      "Parlor 2H",
      "Parlor 3",
      "Custom",
    ],
  },
  {
    slug: "gibson",
    name: "Gibson",
    tier: "MAJOR",
    blurb: "Bozeman, Montana. Round shoulders and thump",
    models: [
      "J-45 Standard",
      "J-45 Original",
      "J-45 Vintage",
      "J-35 Original",
      "Hummingbird Standard",
      "Hummingbird Original",
      "Hummingbird Deluxe",
      "Dove Original",
      "SJ-200 Standard",
      "SJ-200 Original",
      "J-185 Original",
      "Southern Jumbo Original",
      "Advanced Jumbo",
      "L-00 Original",
      "L-00 Vintage",
      "L-1",
      "Nick Lucas",
      "Roy Smeck Stage Deluxe",
      "Songwriter Standard Rosewood",
      "Everly Brothers J-180",
      "1942 Banner J-45 (Custom Shop)",
      "1957 SJ-200 (Custom Shop)",
      "1934 Jumbo (Custom Shop)",
      "1936 Advanced Jumbo (Custom Shop)",
      "Murphy Lab Reissue",
      "Custom Shop",
    ],
  },
  {
    slug: "martin",
    name: "Martin",
    tier: "MAJOR",
    blurb: "Nazareth, Pennsylvania. Standard Series and above",
    models: [
      "D-18",
      "D-28",
      "D-35",
      "D-41",
      "D-42",
      "D-45",
      "HD-28",
      "HD-35",
      "D-18 Modern Deluxe",
      "D-28 Modern Deluxe",
      "D-45 Modern Deluxe",
      "000-18",
      "000-28",
      "000-28 Modern Deluxe",
      "000-42",
      "00-18",
      "00-28",
      "00-28VS",
      "OM-21",
      "OM-28",
      "OM-28 Modern Deluxe",
      "OM-42",
      "OM-45",
      "D-18 Authentic 1939",
      "D-28 Authentic 1937",
      "D-45 Authentic 1936",
      "OM-28 Authentic 1931",
      "000-28 Authentic 1937",
      "00-18 Authentic 1931",
      "D-28 Marquis",
      "000-28EC",
      "00-42SC",
      "D-28 Golden Era",
      "Custom Shop",
    ],
  },
  {
    slug: "santa-cruz",
    name: "Santa Cruz",
    tier: "MAJOR",
    blurb: "Richard Hoover. Santa Cruz, California",
    models: [
      "D",
      "D/PW (Pre-War)",
      "Vintage Southerner",
      "OM",
      "OM/PW (Pre-War)",
      "OM Grand",
      "000",
      "00",
      "0",
      "1929 00",
      "1934 D",
      "H13",
      "F",
      "FS",
      "FTC",
      "Firefly",
      "Style 1",
      "Style 2",
      "Style 3",
      "Tony Rice (TRD)",
      "Brad Paisley Pro",
      "Janis Ian",
      "Bob Brozman",
      "Happy Traum",
      "Cowboy Slinger",
      "Custom",
    ],
  },
  {
    slug: "taylor",
    name: "Taylor",
    tier: "MAJOR",
    blurb: "El Cajon, California. 700 Series and above",
    models: [
      "714ce",
      "717e",
      "717e Builder's Edition",
      "810e",
      "812ce",
      "814ce",
      "814ce Builder's Edition",
      "816ce",
      "816ce Builder's Edition",
      "818e",
      "912ce",
      "912ce Builder's Edition",
      "914ce",
      "K14ce",
      "K14ce Builder's Edition",
      "K22ce",
      "K24ce",
      "PS12ce (Presentation)",
      "PS14ce (Presentation)",
      "517e Builder's Edition",
      "652ce Builder's Edition",
      "324ce Builder's Edition",
      "Custom Shop",
    ],
  },
];

// ---------------------------------------------------------------------------
// BOUTIQUE builders. the top 30, with the body styles they normally make.
// ---------------------------------------------------------------------------

export const BOUTIQUE_BRANDS: Brand[] = [
  {
    slug: "applegate",
    name: "Applegate",
    tier: "BOUTIQUE",
    blurb: "Brian Applegate",
    shapes: ["OM", "000", "Dreadnought", "00"],
  },
  {
    slug: "bashkin",
    name: "Bashkin",
    tier: "BOUTIQUE",
    blurb: "Michael Bashkin. Fort Collins, CO",
    shapes: ["OM", "00", "Placencia", "Grand Concert"],
  },
  {
    slug: "beneteau",
    name: "Beneteau",
    tier: "BOUTIQUE",
    blurb: "Marc Beneteau. Ontario",
    shapes: ["OM", "Dreadnought", "Grand Concert", "Jumbo"],
  },
  {
    slug: "borges",
    name: "Borges",
    tier: "BOUTIQUE",
    blurb: "Julius Borges. pre-war voicing",
    shapes: ["Dreadnought", "OM", "000", "12-Fret"],
  },
  {
    slug: "boucher",
    name: "Boucher",
    tier: "BOUTIQUE",
    blurb: "Berthier-sur-Mer, Québec",
    shapes: ["Dreadnought", "OM", "Jumbo", "Parlor", "000"],
  },
  {
    slug: "charis",
    name: "Charis",
    tier: "BOUTIQUE",
    blurb: "Bill Wise. Michigan",
    shapes: ["SJ", "OM", "Dreadnought", "Grand Concert"],
  },
  {
    slug: "circa",
    name: "Circa",
    tier: "BOUTIQUE",
    blurb: "John Slobod. pre-war dreadnoughts",
    shapes: ["Dreadnought", "OM", "000", "Slope-Shoulder Dreadnought"],
  },
  {
    slug: "franklin",
    name: "Franklin",
    tier: "BOUTIQUE",
    blurb: "Nick Kukich",
    shapes: ["OM", "Jumbo", "Dreadnought", "Parlor"],
  },
  {
    slug: "froggy-bottom",
    name: "Froggy Bottom",
    tier: "BOUTIQUE",
    blurb: "Michael Millard. Vermont",
    shapes: ["H12", "H13", "K", "L", "M", "P (Parlor)", "Dreadnought"],
  },
  {
    slug: "goodall",
    name: "Goodall",
    tier: "BOUTIQUE",
    blurb: "James Goodall. Hawaii / California",
    shapes: [
      "Grand Concert",
      "Standard",
      "Jumbo",
      "Parlor",
      "Rosewood Standard",
      "Dreadnought",
    ],
  },
  {
    slug: "greenfield",
    name: "Greenfield",
    tier: "BOUTIQUE",
    blurb: "Michael Greenfield. Montréal",
    shapes: ["G1", "G2", "G3", "G4"],
  },
  {
    slug: "hoffman",
    name: "Hoffman",
    tier: "BOUTIQUE",
    blurb: "Charlie Hoffman. Minneapolis",
    shapes: ["OM", "000", "Dreadnought", "Parlor"],
  },
  {
    slug: "huss-dalton",
    name: "Huss & Dalton",
    tier: "BOUTIQUE",
    blurb: "Staunton, Virginia",
    shapes: [
      "D",
      "DS",
      "CM",
      "OM",
      "00",
      "T-0014",
      "Crossroads",
      "Road Edition",
    ],
  },
  {
    slug: "kinnaird",
    name: "Kinnaird",
    tier: "BOUTIQUE",
    blurb: "Steve Kinnaird. Texas",
    shapes: ["OM", "000", "Dreadnought", "Grand Concert"],
  },
  {
    slug: "kopp",
    name: "Kopp",
    tier: "BOUTIQUE",
    blurb: "Kevin Kopp. Montana",
    shapes: ["K-35", "DB", "Sunburst Dreadnought", "OM", "000"],
  },
  {
    slug: "kostal",
    name: "Kostal",
    tier: "BOUTIQUE",
    blurb: "Jason Kostal. Arizona",
    shapes: ["MJ", "OM", "MD (Modified Dreadnought)", "00", "Dreadnought"],
  },
  {
    slug: "lowden",
    name: "Lowden",
    tier: "BOUTIQUE",
    blurb: "George Lowden. Northern Ireland",
    shapes: ["O", "F", "S", "WL (Wee Lowden)", "Pierre Bensusan Signature"],
  },
  {
    slug: "manzer",
    name: "Manzer",
    tier: "BOUTIQUE",
    blurb: "Linda Manzer. Toronto",
    shapes: ["Absolute", "Cowpoke", "Blue Note", "Dreadnought", "Parlor"],
  },
  {
    slug: "mcpherson",
    name: "McPherson",
    tier: "BOUTIQUE",
    blurb: "Sneedville, Tennessee",
    shapes: ["MG 4.5", "MG 5.0", "Sable", "Camrielle", "Touring"],
  },
  {
    slug: "merrill",
    name: "Merrill",
    tier: "BOUTIQUE",
    blurb: "Jim Merrill. pre-war reproductions",
    shapes: ["Dreadnought", "OM", "000", "12-Fret"],
  },
  {
    slug: "olson",
    name: "Olson",
    tier: "BOUTIQUE",
    blurb: "James Olson. Minnesota",
    shapes: ["SJ", "Dreadnought", "Small Jumbo", "Cutaway SJ"],
  },
  {
    slug: "osthoff",
    name: "Osthoff",
    tier: "BOUTIQUE",
    blurb: "John Osthoff",
    shapes: ["OM", "000", "00", "Dreadnought"],
  },
  {
    slug: "petros",
    name: "Petros",
    tier: "BOUTIQUE",
    blurb: "Bruce & Matt Petros. Wisconsin",
    shapes: ["FS", "Tunnel 13", "Grand Concert", "OM", "Parlor"],
  },
  {
    slug: "pre-war-guitars",
    name: "Pre-War Guitars Co.",
    tier: "BOUTIQUE",
    blurb: "Wilmington, North Carolina",
    shapes: ["Dreadnought", "OM", "000", "Herringbone Dreadnought", "12-Fret"],
  },
  {
    slug: "preston-thompson",
    name: "Preston Thompson",
    tier: "BOUTIQUE",
    blurb: "Sisters, Oregon",
    shapes: ["D-MA", "D-BA", "D-EIA", "OM", "000", "Dreadnought"],
  },
  {
    slug: "rockbridge",
    name: "Rockbridge",
    tier: "BOUTIQUE",
    blurb: "Charlottesville, Virginia",
    shapes: ["Dreadnought", "Slope D", "000", "00", "OM"],
  },
  {
    slug: "ryan",
    name: "Ryan",
    tier: "BOUTIQUE",
    blurb: "Kevin Ryan. California",
    shapes: ["Mission", "Nightingale", "Cathedral", "Paradiso", "Abbey"],
  },
  {
    slug: "schoenberg",
    name: "Schoenberg",
    tier: "BOUTIQUE",
    blurb: "Eric Schoenberg",
    shapes: ["Soloist", "OM", "000", "Parlor", "12-Fret"],
  },
  {
    slug: "somogyi",
    name: "Somogyi",
    tier: "BOUTIQUE",
    blurb: "Ervin Somogyi. Oakland",
    shapes: ["OM", "Dreadnought", "Modified Dreadnought", "Grand Concert"],
  },
  {
    slug: "traugott",
    name: "Traugott",
    tier: "BOUTIQUE",
    blurb: "Jeff Traugott. Santa Cruz",
    shapes: ["Model R", "Model BK", "00", "OM"],
  },
  {
    slug: "walker",
    name: "Kim Walker",
    tier: "BOUTIQUE",
    blurb: "Kim Walker. Connecticut",
    shapes: ["Dreadnought", "OM", "000", "Slope-Shoulder Dreadnought"],
  },
  {
    slug: "wingert",
    name: "Wingert",
    tier: "BOUTIQUE",
    blurb: "Kathy Wingert. California",
    shapes: ["Model E", "Model C", "OM", "00", "Parlor"],
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const ALL_BRANDS: Brand[] = [...MAJOR_BRANDS, ...BOUTIQUE_BRANDS];

export function findBrand(nameOrSlug: string): Brand | undefined {
  const needle = normalizeBrandName(nameOrSlug);
  return ALL_BRANDS.find(
    (b) => b.slug === needle || normalizeBrandName(b.name) === needle,
  );
}

/**
 * Models to offer for a brand. Major brands return their model list; boutique
 * builders return the body styles they normally make. Anything unrecognized
 * (a promoted community brand, or "Other") gets the standard shape vocabulary.
 */
export function modelsForBrand(nameOrSlug: string): string[] {
  const brand = findBrand(nameOrSlug);
  if (!brand) return [...BODY_SHAPES];
  if (brand.tier === "MAJOR") return brand.models ?? [...BODY_SHAPES];
  return brand.shapes ?? [...BODY_SHAPES];
}

/** Canonical key for de-duplicating user-entered brand names. */
export function normalizeBrandName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Title-case a user-entered brand for display, preserving existing caps. */
export function prettyBrandName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) =>
      word === word.toUpperCase() && word.length > 1
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

/** How many of the same user-entered brand it takes to join the real list. */
export const BRAND_PROMOTION_THRESHOLD = 10;
