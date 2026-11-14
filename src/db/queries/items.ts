import { and, asc, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { items, type Item } from "@/db/schema";
import type { Category } from "@/lib/categories";
import type { ItemFilters } from "@/lib/validation";

export type WardrobeItem = Item;

export async function listItems(userId: string, filters: ItemFilters = {}) {
  const conditions = [eq(items.userId, userId)];

  if (filters.archived === "1") {
    conditions.push(isNotNull(items.archivedAt));
  } else {
    conditions.push(isNull(items.archivedAt));
  }

  if (filters.q) {
    const needle = `%${filters.q}%`;
    const search = or(
      ilike(items.name, needle),
      ilike(items.brand, needle),
      ilike(items.notes, needle),
      ilike(items.pattern, needle),
    );
    if (search) conditions.push(search);
  }

  if (filters.category) conditions.push(eq(items.category, filters.category));
  if (filters.color) conditions.push(eq(items.primaryColor, filters.color));
  if (filters.favorite === "1") conditions.push(eq(items.favorite, true));

  if (filters.season) {
    conditions.push(
      sql`${items.seasons} @> ${JSON.stringify([filters.season])}::jsonb`,
    );
  }

  if (filters.occasion) {
    conditions.push(
      sql`${items.occasions} @> ${JSON.stringify([filters.occasion])}::jsonb`,
    );
  }

  const orderBy =
    filters.sort === "name"
      ? asc(items.name)
      : filters.sort === "color"
        ? asc(items.primaryColor)
        : desc(items.createdAt);

  return db
    .select()
    .from(items)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(200);
}

export async function getItem(userId: string, id: string) {
  return db.query.items.findFirst({
    where: and(eq(items.id, id), eq(items.userId, userId)),
  });
}

export async function countItems(userId: string) {
  const rows = await db
    .select({ category: items.category, total: sql<number>`count(*)::int` })
    .from(items)
    .where(and(eq(items.userId, userId), isNull(items.archivedAt)))
    .groupBy(items.category);

  const counts: Record<Category, number> = {
    top: 0,
    bottom: 0,
    dress: 0,
    outerwear: 0,
    shoes: 0,
    accessory: 0,
  };

  for (const row of rows) {
    counts[row.category as Category] = Number(row.total);
  }

  return { counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
}

export async function favoriteItems(userId: string, limit = 6) {
  return db
    .select()
    .from(items)
    .where(and(eq(items.userId, userId), eq(items.favorite, true)))
    .orderBy(desc(items.updatedAt))
    .limit(limit);
}

export async function recentItems(userId: string, limit = 8) {
  return db
    .select()
    .from(items)
    .where(eq(items.userId, userId))
    .orderBy(desc(items.createdAt))
    .limit(limit);
}
