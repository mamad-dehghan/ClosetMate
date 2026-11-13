import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { items, preferences } from "@/db/schema";
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
