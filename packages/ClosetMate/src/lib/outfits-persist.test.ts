/**
 * Integration test for outfit persistence against a throwaway PGlite database.
 * Uses its own directory so it never touches the dev database.
 */
process.env.PGLITE_DIR = ".data/test-outfits";
process.env.DATABASE_URL = "";

import { rm } from "node:fs/promises";
import { describe, expect, test } from "bun:test";

const dir = ".data/test-outfits";
await rm(dir, { recursive: true, force: true });

const { db } = await import("../db/client");
const { migrate } = await import("drizzle-orm/pglite/migrator");
await migrate(db as never, { migrationsFolder: "drizzle" });

const { items, outfitItems, outfits, users } = await import("../db/schema");
const { eq } = await import("drizzle-orm");
const { persistOutfit } = await import("./outfits-persist");

const ownerId = crypto.randomUUID();
const strangerId = crypto.randomUUID();

await db.insert(users).values([
  { id: ownerId, name: "Owner" },
  { id: strangerId, name: "Stranger" },
]);

const pieces = await db
  .insert(items)
  .values([
    { userId: ownerId, name: "Tee", category: "top", primaryColor: "#F4EFE6" },
    { userId: ownerId, name: "Jeans", category: "bottom", primaryColor: "#4A6C8C" },
    { userId: ownerId, name: "Sneakers", category: "shoes", primaryColor: "#1C1A17" },
    { userId: strangerId, name: "Not yours", category: "top" },
  ])
  .returning();

const [tee, jeans, sneakers, strangerTop] = pieces;
if (!tee || !jeans || !sneakers || !strangerTop) {
  throw new Error("fixture setup failed");
}

async function links(outfitId: string) {
  return db
    .select()
    .from(outfitItems)
    .where(eq(outfitItems.outfitId, outfitId))
    .orderBy(outfitItems.position);
}

async function findOutfit(id: string) {
  const [row] = await db.select().from(outfits).where(eq(outfits.id, id));
  return row;
}

describe("persistOutfit", () => {
  test("creates an outfit with ordered pieces", async () => {
    const result = await persistOutfit(ownerId, {
      name: "",
      occasion: "casual",
      favorite: true,
      itemIds: [tee.id, jeans.id, sneakers.id],
    });

    expect("id" in result).toBe(true);
    if (!("id" in result)) return;

    const outfit = await findOutfit(result.id);
    expect(outfit?.name).toBe("Casual outfit");
    expect(outfit?.userId).toBe(ownerId);
    expect(outfit?.favorite).toBe(true);

    const rows = await links(result.id);
    expect(rows.map((row) => row.itemId)).toEqual([tee.id, jeans.id, sneakers.id]);
    expect(rows.map((row) => row.position)).toEqual([0, 1, 2]);
  });

  test("keeps a provided name", async () => {
    const result = await persistOutfit(ownerId, {
      name: "  Weekend  ",
      itemIds: [tee.id],
    });
    expect("id" in result).toBe(true);
    if (!("id" in result)) return;

    const outfit = await findOutfit(result.id);
    expect(outfit?.name).toBe("Weekend");
  });

  test("rejects pieces owned by someone else", async () => {
    const result = await persistOutfit(ownerId, {
      name: "Sneaky",
      itemIds: [tee.id, strangerTop.id],
    });

    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("no longer in your wardrobe");
  });

  test("replaces pieces when updating", async () => {
    const created = await persistOutfit(ownerId, {
      name: "Two piece",
      itemIds: [tee.id, jeans.id],
    });
    expect("id" in created).toBe(true);
    if (!("id" in created)) return;

    const updated = await persistOutfit(
      ownerId,
      { name: "One piece", itemIds: [sneakers.id] },
      created.id,
    );
    expect("id" in updated).toBe(true);

    const rows = await links(created.id);
    expect(rows.map((row) => row.itemId)).toEqual([sneakers.id]);
    expect(rows.length).toBe(1);

    const outfit = await findOutfit(created.id);
    expect(outfit?.name).toBe("One piece");
  });

  test("refuses to update another user's outfit", async () => {
    const created = await persistOutfit(ownerId, {
      name: "Mine",
      itemIds: [tee.id],
    });
    expect("id" in created).toBe(true);
    if (!("id" in created)) return;

    const hijack = await persistOutfit(
      strangerId,
      { name: "Hijacked", itemIds: [strangerTop.id] },
      created.id,
    );

    expect("error" in hijack).toBe(true);
    if (!("error" in hijack)) return;
    expect(hijack.error).toContain("not in your wardrobe");

    const outfit = await findOutfit(created.id);
    expect(outfit?.name).toBe("Mine");
  });
});
