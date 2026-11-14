/**
 * Archived filtering is enforced in the query layer, so it is tested against
 * a throwaway PGlite database rather than mocked.
 */
process.env.PGLITE_DIR = ".data/test-items";
process.env.DATABASE_URL = "";

import { rm } from "node:fs/promises";
import { describe, expect, test } from "bun:test";

const dir = ".data/test-items";
await rm(dir, { recursive: true, force: true });

const { db } = await import("../client");
const { migrate } = await import("drizzle-orm/pglite/migrator");
await migrate(db as never, { migrationsFolder: "drizzle" });

const { items, users } = await import("../schema");
const { countItems, listItems } = await import("./items");

const userId = crypto.randomUUID();
await db.insert(users).values({ id: userId, name: "Filter Tester" });

await db.insert(items).values([
  { userId, name: "Active tee", category: "top" },
  { userId, name: "Active jeans", category: "bottom" },
  {
    userId,
    name: "Archived coat",
    category: "outerwear",
    archivedAt: new Date(),
  },
]);

describe("listItems", () => {
  test("excludes archived pieces by default", async () => {
    const rows = await listItems(userId);
    expect(rows.map((row) => row.name).sort()).toEqual([
      "Active jeans",
      "Active tee",
    ]);
  });

  test("returns only archived pieces when asked", async () => {
    const rows = await listItems(userId, { archived: "1" });
    expect(rows.map((row) => row.name)).toEqual(["Archived coat"]);
  });

  test("counts only active pieces", async () => {
    const { total, counts } = await countItems(userId);
    expect(total).toBe(2);
    expect(counts.outerwear).toBe(0);
    expect(counts.top).toBe(1);
  });
});
