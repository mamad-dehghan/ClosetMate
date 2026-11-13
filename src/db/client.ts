import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema> & {
  $client: unknown;
};

type DbGlobal = typeof globalThis & {
  __closetmateDb?: Database;
  __closetmatePglite?: PGlite;
  __closetmatePool?: Pool;
};

const globalForDb = globalThis as DbGlobal;

export function createPgliteClient(dataDir = ".data/pglite") {
  const resolved = path.resolve(process.cwd(), dataDir);
  mkdirSync(resolved, { recursive: true });
  return new PGlite(resolved);
}

export function createDbFromPool(pool: Pool): Database {
  return drizzlePg(pool, { schema, casing: "snake_case" }) as unknown as Database;
}

export function createDbFromPglite(client: PGlite): Database {
  return drizzlePglite(client, { schema, casing: "snake_case" }) as unknown as Database;
}

/**
 * The app talks to one `db` object. Locally that is an embedded PGlite
 * instance (no Docker, no install); in production it is Neon/Postgres via
 * a normal `pg` pool. Both speak PostgreSQL, so nothing else changes.
 */
function createDb(): Database {
  const url = process.env.DATABASE_URL;

  if (url && /^postgres(ql)?:\/\//i.test(url)) {
    const pool =
      globalForDb.__closetmatePool ??
      new Pool({ connectionString: url, max: 5 });
    globalForDb.__closetmatePool = pool;
    return createDbFromPool(pool);
  }

  const client =
    globalForDb.__closetmatePglite ?? createPgliteClient(process.env.PGLITE_DIR);
  globalForDb.__closetmatePglite = client;
  return createDbFromPglite(client);
}

export const db: Database = globalForDb.__closetmateDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__closetmateDb = db;
}

export { schema };
