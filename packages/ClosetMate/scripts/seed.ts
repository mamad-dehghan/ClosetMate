/**
 * Seeds a demo account with the twelve sample pieces.
 * Usage: bun scripts/seed.ts
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { users } from "../src/db/schema";
import { ensurePreferences, seedOutfits, seedWardrobe } from "../src/lib/seed";

const EMAIL = "demo@closetmate.app";

const existing = await db.query.users.findFirst({
  where: eq(users.email, EMAIL),
});

let userId = existing?.id;

if (!userId) {
  const [created] = await db
    .insert(users)
    .values({
      email: EMAIL,
      name: "Demo",
      emailVerified: new Date(),
    })
    .returning({ id: users.id });

  if (!created) throw new Error("Could not create the demo account");
  userId = created.id;
  console.log(`Created demo account ${EMAIL}`);
} else {
  console.log(`Demo account ${EMAIL} already exists`);
}

await ensurePreferences(userId);
const added = await seedWardrobe(userId);
const outfitsAdded = await seedOutfits(userId);

console.log(
  added > 0
    ? `Seeded ${added} pieces.`
    : "Wardrobe already has items, nothing seeded.",
);
console.log(
  outfitsAdded > 0
    ? `Seeded ${outfitsAdded} outfits.`
    : "Outfits already exist, nothing seeded.",
);
console.log(`Sign in with the dev login using ${EMAIL}`);

process.exit(0);
