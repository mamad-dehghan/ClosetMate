import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { outfitItems, outfits, preferences, users } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { listItems } from "@/db/queries/items";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full JSON export of a wardrobe — the data-portability promise. */
export async function GET() {
  const actor = await requireActor();

  const [user, prefs, wardrobe, userOutfits] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, actor.userId),
      columns: { id: true, name: true, email: true, createdAt: true },
    }),
    db.query.preferences.findFirst({
      where: eq(preferences.userId, actor.userId),
    }),
    listItems(actor.userId),
    db.select().from(outfits).where(eq(outfits.userId, actor.userId)),
  ]);

  const outfitIds = userOutfits.map((outfit) => outfit.id);
  const outfitPieces =
    outfitIds.length > 0
      ? await db
          .select()
          .from(outfitItems)
          .where(inArray(outfitItems.outfitId, outfitIds))
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
