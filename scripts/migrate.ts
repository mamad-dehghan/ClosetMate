/**
 * Applies generated SQL migrations to whichever database is configured.
 * Usage: bun scripts/migrate.ts
 */
import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../src/db/schema";

const migrationsFolder = "./drizzle";
const url = process.env.DATABASE_URL;

if (url && /^postgres(ql)?:\/\//i.test(url)) {
  const pool = new Pool({ connectionString: url, max: 2 });
  const db = drizzlePg(pool, { schema, casing: "snake_case" });
  await migratePg(db, { migrationsFolder });
  await pool.end();
  console.log("Migrations applied to Postgres.");
} else {
  const dataDir = process.env.PGLITE_DIR ?? ".data/pglite";
  mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client, { schema, casing: "snake_case" });
  await migratePglite(db, { migrationsFolder });
  await client.close();
  console.log("Migrations applied to local PGlite (.data/pglite).");
}
