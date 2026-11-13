/**
 * Wipes the local PGlite database, applies migrations and reseeds the demo
 * account. Use when the embedded database is corrupted (e.g. the dev server
 * was force-killed while Postgres was writing).
 *
 * Usage: bun run db:reset
 * Only touches the local PGlite directory — never a remote DATABASE_URL.
 */
import { rm } from "node:fs/promises";

if (process.env.DATABASE_URL && /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL)) {
  console.error(
    "Refusing to reset: DATABASE_URL points at a real Postgres server.",
  );
  process.exit(1);
}

const dir = process.env.PGLITE_DIR ?? ".data/pglite";
await rm(dir, { recursive: true, force: true });
console.log(`Removed ${dir}`);

function run(args: string[]) {
  const result = Bun.spawnSync(["bun", ...args], {
    stdout: "inherit",
    stderr: "inherit",
  });
  if (result.exitCode !== 0) process.exit(result.exitCode ?? 1);
}

run(["scripts/migrate.ts"]);
run(["scripts/seed.ts"]);
console.log("Local database reset complete.");
