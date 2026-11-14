import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  capsules,
  challengeCompletions,
  outfitWears,
  outfits,
} from "@/db/schema";

export async function wearsBetween(
  userId: string,
  from: string,
  to: string,
) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(outfitWears)
    .where(
      and(
        eq(outfitWears.userId, userId),
        gte(outfitWears.wornOn, from),
        lte(outfitWears.wornOn, to),
      ),
    );
  return Number(row?.total ?? 0);
}

export async function outfitsCreatedBetween(
  userId: string,
  from: string,
  to: string,
) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(outfits)
    .where(
      and(
        eq(outfits.userId, userId),
        sql`to_char(${outfits.createdAt}, 'YYYY-MM-DD') between ${from} and ${to}`,
      ),
    );
  return Number(row?.total ?? 0);
}

export async function capsuleCount(userId: string) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(capsules)
    .where(eq(capsules.userId, userId));
  return Number(row?.total ?? 0);
}

export async function completionsByKey(userId: string) {
  const rows = await db
    .select()
    .from(challengeCompletions)
    .where(eq(challengeCompletions.userId, userId));

  return new Map(rows.map((row) => [row.key, row.completedOn]));
}
