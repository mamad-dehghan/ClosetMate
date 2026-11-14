import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { capsuleItems, capsules, items, type Capsule, type Item } from "@/db/schema";

export type CapsuleWithPieces = Capsule & { pieces: Item[] };

async function attachPieces(
  userId: string,
  rows: Capsule[],
): Promise<CapsuleWithPieces[]> {
  if (rows.length === 0) return [];

  const links = await db
    .select()
    .from(capsuleItems)
    .where(inArray(capsuleItems.capsuleId, rows.map((row) => row.id)));

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
      .filter((link) => link.capsuleId === row.id)
      .sort((a, b) => a.position - b.position)
      .map((link) => byId.get(link.itemId))
      .filter((piece): piece is Item => Boolean(piece)),
  }));
}

export async function listCapsules(userId: string) {
  const rows = await db
    .select()
    .from(capsules)
    .where(eq(capsules.userId, userId))
    .orderBy(desc(capsules.updatedAt))
    .limit(50);

  return attachPieces(userId, rows);
}

export async function getCapsule(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(capsules)
    .where(and(eq(capsules.id, id), eq(capsules.userId, userId)))
    .limit(1);

  if (!row) return null;
  const [withPieces] = await attachPieces(userId, [row]);
  return withPieces ?? null;
}

export async function countCapsules(userId: string) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(capsules)
    .where(eq(capsules.userId, userId));
  return Number(row?.total ?? 0);
}
