import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { items, outfits, tags, users } from "@/db/schema";
import { ensurePreferences, seedCapsules, seedOutfits, seedWardrobe } from "./seed";

export const GUEST_COOKIE = "cm_guest";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return process.env.AUTH_SECRET ?? "closetmate-dev-secret-change-me";
}

export function signGuestToken(userId: string) {
  const signature = createHmac("sha256", secret()).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

export function verifyGuestToken(token: string | undefined | null) {
  if (!token) return null;
  const index = token.lastIndexOf(".");
  if (index <= 0) return null;
  const userId = token.slice(0, index);
  const signature = token.slice(index + 1);
  const expected = createHmac("sha256", secret()).update(userId).digest("hex");
  if (signature.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  return userId;
}

export const guestCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};

export async function createGuestUser() {
  const [user] = await db
    .insert(users)
    .values({ name: "Guest", isAnonymous: true })
    .returning();

  if (!user) throw new Error("Could not create guest session");

  await ensurePreferences(user.id);
  await seedWardrobe(user.id);
  await seedOutfits(user.id);
  await seedCapsules(user.id);

  return user;
}

export async function isGuestUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, isAnonymous: true },
  });
  return Boolean(user?.isAnonymous);
}

/**
 * Moves everything a guest created onto the real account, then removes the
 * anonymous row. Safe to call more than once.
 */
export async function claimGuestWardrobe(guestId: string, userId: string) {
  if (guestId === userId) return;

  const guest = await db.query.users.findFirst({
    where: eq(users.id, guestId),
    columns: { id: true, isAnonymous: true },
  });
  if (!guest?.isAnonymous) return;

  await db.transaction(async (tx) => {
    await tx.update(items).set({ userId }).where(eq(items.userId, guestId));
    await tx.update(tags).set({ userId }).where(eq(tags.userId, guestId));
    await tx.update(outfits).set({ userId }).where(eq(outfits.userId, guestId));
    await tx.delete(users).where(eq(users.id, guestId));
  });

  await db
    .update(users)
    .set({ claimedAt: new Date() })
    .where(eq(users.id, userId));
}
