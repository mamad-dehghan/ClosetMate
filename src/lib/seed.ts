import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  items,
  outfitItems,
  outfitPlans,
  outfitWears,
  outfits,
  preferences,
} from "@/db/schema";
import { todayISO } from "./outfits";
import { SAMPLE_ITEMS } from "./sample-wardrobe";

export async function ensurePreferences(userId: string) {
  const existing = await db.query.preferences.findFirst({
    where: eq(preferences.userId, userId),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(preferences)
    .values({ userId })
    .returning();
  return created;
}

export async function seedWardrobe(userId: string) {
  const existing = await db.query.items.findFirst({
    where: eq(items.userId, userId),
  });
  if (existing) return 0;

  await db.insert(items).values(
    SAMPLE_ITEMS.map((item) => ({
      userId,
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      primaryColor: item.primaryColor,
      seasons: item.seasons,
      occasions: item.occasions,
      pattern: item.pattern,
      brand: item.brand ?? null,
      notes: item.notes ?? null,
      purchasePrice: item.purchasePrice ?? null,
    })),
  );

  return SAMPLE_ITEMS.length;
}

const SAMPLE_OUTFITS = [
  {
    name: "Everyday neutrals",
    occasion: "casual",
    season: "spring",
    favorite: true,
    pieces: ["Ivory cotton tee", "Straight-leg jeans", "White leather sneakers"],
  },
  {
    name: "Coat and boots",
    occasion: "work",
    season: "winter",
    favorite: false,
    pieces: [
      "Charcoal merino sweater",
      "Black tailored trousers",
      "Camel wool coat",
      "Chestnut chelsea boots",
    ],
  },
  {
    name: "Weekend shirt",
    occasion: "casual",
    season: "summer",
    favorite: false,
    pieces: [
      "Striped linen shirt",
      "Sand chinos",
      "White leather sneakers",
      "Canvas tote",
    ],
  },
  {
    name: "Dinner in green",
    occasion: "evening",
    season: "summer",
    favorite: false,
    pieces: ["Forest midi dress", "Chestnut chelsea boots", "Canvas tote"],
  },
];

/**
 * Seeds four outfits plus a little history so the demo shows the outfit
 * features, not an empty state.
 */
export async function seedOutfits(userId: string) {
  const existing = await db.query.outfits.findFirst({
    where: eq(outfits.userId, userId),
    columns: { id: true },
  });
  if (existing) return 0;

  const wardrobe = await db
    .select({ id: items.id, name: items.name })
    .from(items)
    .where(eq(items.userId, userId));
  const byName = new Map(wardrobe.map((item) => [item.name, item.id]));

  let created = 0;
  const createdIds: string[] = [];

  for (const definition of SAMPLE_OUTFITS) {
    const ids = definition.pieces
      .map((name) => byName.get(name))
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) continue;

    const [outfit] = await db
      .insert(outfits)
      .values({
        userId,
        name: definition.name,
        occasion: definition.occasion,
        season: definition.season,
        favorite: definition.favorite,
      })
      .returning({ id: outfits.id });

    if (!outfit) continue;

    await db.insert(outfitItems).values(
      ids.map((itemId, position) => ({
        outfitId: outfit.id,
        itemId,
        position,
      })),
    );

    createdIds.push(outfit.id);
    created += 1;
  }

  const everyday = createdIds[0];
  if (everyday) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = `${yesterday.getFullYear()}-${String(
      yesterday.getMonth() + 1,
    ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    await db.insert(outfitWears).values({
      userId,
      outfitId: everyday,
      wornOn: yesterdayISO,
      note: "Seeded history",
    });

    await db.insert(outfitPlans).values({
      userId,
      outfitId: everyday,
      plannedFor: todayISO(),
      occasion: "casual",
    });
  }

  return created;
}
