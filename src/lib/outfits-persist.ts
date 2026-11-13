import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { items, outfitItems, outfits } from "@/db/schema";
import { defaultOutfitName } from "./outfits";

export type OutfitDraft = {
  name: string;
  description?: string | null;
  occasion?: string | null;
  season?: string | null;
  favorite?: boolean;
  itemIds: string[];
};

export type PersistOutfitResult = { id: string } | { error: string };

/**
 * Creates or replaces an outfit and its pieces. Kept free of Next.js request
 * APIs so it can be exercised directly in tests.
 */
export async function persistOutfit(
  userId: string,
  input: OutfitDraft,
  id?: string,
): Promise<PersistOutfitResult> {
  const owned = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.userId, userId), inArray(items.id, input.itemIds)));

  if (owned.length !== input.itemIds.length) {
    return { error: "Some pieces are no longer in your wardrobe." };
  }

  const values = {
    name: defaultOutfitName(input.name, input.occasion),
    description: input.description ?? null,
    occasion: input.occasion ?? null,
    season: input.season ?? null,
    favorite: input.favorite ?? false,
    updatedAt: new Date(),
  };

  const links = input.itemIds.map((itemId, position) => ({ itemId, position }));

  if (id) {
    const existing = await db.query.outfits.findFirst({
      where: and(eq(outfits.id, id), eq(outfits.userId, userId)),
      columns: { id: true },
    });
    if (!existing) return { error: "That outfit is not in your wardrobe." };

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(outfits)
          .set(values)
          .where(and(eq(outfits.id, id), eq(outfits.userId, userId)));
        await tx.delete(outfitItems).where(eq(outfitItems.outfitId, id));
        await tx
          .insert(outfitItems)
          .values(links.map((link) => ({ ...link, outfitId: id })));
      });
    } catch {
      return { error: "Could not save this outfit. Try again." };
    }

    return { id };
  }

  try {
    const [created] = await db
      .insert(outfits)
      .values({ ...values, userId })
      .returning({ id: outfits.id });

    if (!created) return { error: "Could not save this outfit." };

    await db
      .insert(outfitItems)
      .values(links.map((link) => ({ ...link, outfitId: created.id })));

    return { id: created.id };
  } catch {
    return { error: "Could not save this outfit. Try again." };
  }
}
