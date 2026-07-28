import Typesense from "typesense";
import type { Client } from "typesense";
import type { Listing } from "@prisma/client";

let client: Client | null = null;

function getClient(): Client {
  const { TYPESENSE_HOST, TYPESENSE_API_KEY } = process.env;
  if (!TYPESENSE_HOST || !TYPESENSE_API_KEY) {
    throw new Error("Typesense credentials are not set");
  }
  if (!client) {
    client = new Typesense.Client({
      nodes: [
        {
          host: TYPESENSE_HOST,
          port: Number(process.env.TYPESENSE_PORT ?? 8108),
          protocol: process.env.TYPESENSE_PROTOCOL ?? "http",
        },
      ],
      apiKey: TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 5,
    });
  }
  return client;
}

const LISTINGS_COLLECTION = "listings";

const schema = {
  name: LISTINGS_COLLECTION,
  fields: [
    { name: "brand", type: "string" as const, facet: true },
    { name: "model", type: "string" as const },
    { name: "year", type: "int32" as const, optional: true, facet: true },
    { name: "price", type: "int32" as const, facet: true },
    { name: "condition", type: "string" as const, facet: true },
    { name: "status", type: "string" as const, facet: true },
  ],
  default_sorting_field: "price",
};

/**
 * Ensure the listings collection exists. Safe to call repeatedly.
 */
async function ensureCollection(): Promise<void> {
  const c = getClient();
  try {
    await c.collections(LISTINGS_COLLECTION).retrieve();
  } catch {
    await c.collections().create(schema);
  }
}

function toDocument(listing: Listing) {
  return {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year ?? undefined,
    price: listing.price,
    condition: listing.condition,
    status: listing.status,
  };
}

/**
 * Upsert a listing into the search index. Mirrors the Listing table fields
 * needed for search. Call on listing create/update.
 */
export async function indexListing(listing: Listing): Promise<void> {
  try {
    await ensureCollection();
    await getClient()
      .collections(LISTINGS_COLLECTION)
      .documents()
      .upsert(toDocument(listing));
  } catch (err) {
    // Search indexing is non-critical. never block the write path.
    console.error("Typesense indexListing failed:", err);
  }
}


