import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { capsuleItems, capsules, challengeCompletions, outfitItems, outfits, preferences, users } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { listItems } from "@/db/queries/items";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full JSON export of a wardrobe — the data-portability promise. */
export async function GET() {
  const actor = await requireActor();

  const [user, prefs, activeItems, archivedItems, userOutfits, userCapsules, completions] =
    await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, actor.userId),
        columns: { id: true, name: true, email: true, createdAt: true },
      }),
      db.query.preferences.findFirst({
        where: eq(preferences.userId, actor.userId),
      }),
      listItems(actor.userId),
      listItems(actor.userId, { archived: "1" }),
      db.select().from(outfits).where(eq(outfits.userId, actor.userId)),
      db.select().from(capsules).where(eq(capsules.userId, actor.userId)),
      db
        .select()
        .from(challengeCompletions)
        .where(eq(challengeCompletions.userId, actor.userId)),
    ]);

  const wardrobe = [...activeItems, ...archivedItems];

  const outfitIds = userOutfits.map((outfit) => outfit.id);
  const outfitPieces =
    outfitIds.length > 0
      ? await db
          .select()
          .from(outfitItems)
          .where(inArray(outfitItems.outfitId, outfitIds))
      : [];

  const capsuleIds = userCapsules.map((capsule) => capsule.id);
  const capsulePieces =
    capsuleIds.length > 0
      ? await db
          .select()
          .from(capsuleItems)
          .where(inArray(capsuleItems.capsuleId, capsuleIds))
      : [];

  const payload = {
    exportedAt: new Date().toISOString(),
    app: "ClosetMate",
    account: user ?? null,
    preferences: prefs ?? null,
    items: wardrobe,
    outfits: userOutfits.map((outfit) => ({
      ...outfit,
      items: outfitPieces
        .filter((piece) => piece.outfitId === outfit.id)
        .map((piece) => piece.itemId),
    })),
    capsules: userCapsules.map((capsule) => ({
      ...capsule,
      items: capsulePieces
        .filter((piece) => piece.capsuleId === capsule.id)
        .map((piece) => piece.itemId),
    })),
    challengeCompletions: completions,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="closetmate-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
