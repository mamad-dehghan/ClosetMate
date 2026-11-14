import type { Item } from "@/db/schema";

let counter = 0;

/** Minimal complete Item for scoring tests. */
export function makeItem(
  overrides: Partial<Item> & { category: string } & { id?: string },
): Item {
  counter += 1;
  return {
    id: overrides.id ?? `item-${counter}`,
    userId: "user-1",
    name: overrides.name ?? `Item ${counter}`,
    category: overrides.category,
    subcategory: overrides.subcategory ?? null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    primaryColor: overrides.primaryColor ?? "#1C1A17",
    secondaryColors: [],
    seasons: overrides.seasons ?? [],
    occasions: overrides.occasions ?? [],
    pattern: null,
    brand: null,
    notes: null,
    purchasePrice: overrides.purchasePrice ?? null,
    currency: "USD",
    laundryStatus: overrides.laundryStatus ?? "available",
    favorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Item;
}
