import { cookies } from "next/headers";
import { auth } from "./auth";
import { GUEST_COOKIE, isGuestUser, verifyGuestToken } from "./guest";

export type Actor = { userId: string; isGuest: boolean };

/**
 * Resolves who is making the request: a signed-in account, or the anonymous
 * guest stored in the cm_guest cookie. Every server read/write goes through
 * this so ownership checks live in one place.
 */
export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id, isGuest: false };
  }

  const store = await cookies();
  const guestId = verifyGuestToken(store.get(GUEST_COOKIE)?.value);
  if (!guestId) return null;

  if (!(await isGuestUser(guestId))) return null;
  return { userId: guestId, isGuest: true };
}

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw new Error("UNAUTHORIZED");
  return actor;
}
