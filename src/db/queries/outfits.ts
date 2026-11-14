import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  items,
  outfitItems,
  outfitPlans,
  outfitWears,
  outfits,
  type Item,
  type Outfit,
} from "@/db/schema";

export type OutfitWithPieces = Outfit & { pieces: Item[] };

export type WearInfo = { wears: number; lastWorn: string | null };

export type PlanWithOutfit = {
  id: string;
  plannedFor: string;
  occasion: string | null;
  note: string | null;
  outfit: Outfit;
  pieces: Item[];
};

async function attachPieces(
  userId: string,
  rows: Outfit[],
): Promise<OutfitWithPieces[]> {
  if (rows.length === 0) return [];

  const links = await db
    .select()
    .from(outfitItems)
    .where(inArray(outfitItems.outfitId, rows.map((row) => row.id)));

  const itemIds = [...new Set(links.map((link) => link.itemId))];

  const pieces =
    itemIds.length > 0
      ? await db
          .select()
          .from(items)
          .where(and(eq(items.userId, userId), inArray(items.id, itemIds)))
      : [];

  const byId = new Map(pieces.map((piece) => [piece.id, piece]));

  return rows.map((row) => ({
    ...row,
    pieces: links
      .filter((link) => link.outfitId === row.id)
      .sort((a, b) => a.position - b.position)
      .map((link) => byId.get(link.itemId))
      .filter((piece): piece is Item => Boolean(piece)),
  }));
}

export async function listOutfits(
  userId: string,
  filters: { favorite?: boolean; occasion?: string } = {},
): Promise<OutfitWithPieces[]> {
  const conditions = [eq(outfits.userId, userId)];
  if (filters.favorite) conditions.push(eq(outfits.favorite, true));
  if (filters.occasion) conditions.push(eq(outfits.occasion, filters.occasion));

  const rows = await db
    .select()
    .from(outfits)
    .where(and(...conditions))
    .orderBy(desc(outfits.updatedAt))
    .limit(100);

  return attachPieces(userId, rows);
}

export async function getOutfit(
  userId: string,
  id: string,
): Promise<OutfitWithPieces | null> {
  const [row] = await db
    .select()
    .from(outfits)
    .where(and(eq(outfits.id, id), eq(outfits.userId, userId)))
    .limit(1);

  if (!row) return null;
  const [withPieces] = await attachPieces(userId, [row]);
  return withPieces ?? null;
}

export async function countOutfits(userId: string) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(outfits)
    .where(eq(outfits.userId, userId));
  return Number(row?.total ?? 0);
}

export async function wearInfoByOutfit(userId: string) {
  const rows = await db
    .select({
      outfitId: outfitWears.outfitId,
      wears: sql<number>`count(*)::int`,
      lastWorn: sql<string | null>`max(${outfitWears.wornOn})`,
    })
    .from(outfitWears)
    .where(eq(outfitWears.userId, userId))
    .groupBy(outfitWears.outfitId);

  return new Map<string, WearInfo>(
    rows.map((row) => [
      row.outfitId,
      { wears: Number(row.wears), lastWorn: row.lastWorn },
    ]),
  );
}

export async function wearInfoForOutfit(
  userId: string,
  outfitId: string,
): Promise<WearInfo> {
  const [row] = await db
    .select({
      wears: sql<number>`count(*)::int`,
      lastWorn: sql<string | null>`max(${outfitWears.wornOn})`,
    })
    .from(outfitWears)
    .where(
      and(eq(outfitWears.userId, userId), eq(outfitWears.outfitId, outfitId)),
    );

  return {
    wears: Number(row?.wears ?? 0),
    lastWorn: row?.lastWorn ?? null,
  };
}

export async function wearsThisMonth(userId: string, month: string) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(outfitWears)
    .where(
      and(
        eq(outfitWears.userId, userId),
        sql`to_char(${outfitWears.wornOn}, 'YYYY-MM') = ${month}`,
      ),
    );
  return Number(row?.total ?? 0);
}

export async function lastWornByItem(userId: string) {
  const rows = await db
    .select({
      itemId: outfitItems.itemId,
      wears: sql<number>`count(*)::int`,
      lastWorn: sql<string | null>`max(${outfitWears.wornOn})`,
    })
    .from(outfitWears)
    .innerJoin(outfitItems, eq(outfitItems.outfitId, outfitWears.outfitId))
    .where(eq(outfitWears.userId, userId))
    .groupBy(outfitItems.itemId);

  return new Map<string, WearInfo>(
    rows.map((row) => [
      row.itemId,
      { wears: Number(row.wears), lastWorn: row.lastWorn },
    ]),
  );
}

export async function itemWearStats(userId: string, itemId: string) {
  const [row] = await db
    .select({
      wears: sql<number>`count(*)::int`,
      lastWorn: sql<string | null>`max(${outfitWears.wornOn})`,
    })
    .from(outfitWears)
    .innerJoin(outfitItems, eq(outfitItems.outfitId, outfitWears.outfitId))
    .where(
      and(eq(outfitWears.userId, userId), eq(outfitItems.itemId, itemId)),
    );

  return {
    wears: Number(row?.wears ?? 0),
    lastWorn: row?.lastWorn ?? null,
  };
}

export async function plansBetween(
  userId: string,
  from: string,
  to: string,
): Promise<PlanWithOutfit[]> {
  const rows = await db
    .select({ plan: outfitPlans, outfit: outfits })
    .from(outfitPlans)
    .innerJoin(outfits, eq(outfits.id, outfitPlans.outfitId))
    .where(
      and(
        eq(outfitPlans.userId, userId),
        eq(outfits.userId, userId),
        gte(outfitPlans.plannedFor, from),
        lte(outfitPlans.plannedFor, to),
      ),
    )
    .orderBy(outfitPlans.plannedFor);

  if (rows.length === 0) return [];

  const outfitIds = [...new Set(rows.map((row) => row.outfit.id))];
  const links = await db
    .select()
    .from(outfitItems)
    .where(inArray(outfitItems.outfitId, outfitIds));
  const itemIds = [...new Set(links.map((link) => link.itemId))];
  const pieces =
    itemIds.length > 0
      ? await db
          .select()
          .from(items)
          .where(and(eq(items.userId, userId), inArray(items.id, itemIds)))
      : [];
  const byId = new Map(pieces.map((piece) => [piece.id, piece]));

  return rows.map((row) => ({
    id: row.plan.id,
    plannedFor: row.plan.plannedFor,
    occasion: row.plan.occasion,
    note: row.plan.note,
    outfit: row.outfit,
    pieces: links
      .filter((link) => link.outfitId === row.outfit.id)
      .sort((a, b) => a.position - b.position)
      .map((link) => byId.get(link.itemId))
      .filter((piece): piece is Item => Boolean(piece)),
  }));
}

export async function planForDate(
  userId: string,
  iso: string,
): Promise<PlanWithOutfit | null> {
  const plans = await plansBetween(userId, iso, iso);
  return plans[0] ?? null;
}
