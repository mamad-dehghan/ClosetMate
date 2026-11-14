import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { suggestionRejections } from "@/db/schema";

export async function rejectionsForDay(userId: string, day: string) {
  const rows = await db
    .select({ signature: suggestionRejections.signature })
    .from(suggestionRejections)
    .where(
      and(
        eq(suggestionRejections.userId, userId),
        eq(suggestionRejections.day, day),
      ),
    );

  return rows.map((row) => row.signature);
}
