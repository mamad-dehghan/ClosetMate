"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import {
  GUEST_COOKIE,
  claimGuestWardrobe,
  verifyGuestToken,
} from "@/lib/guest";

/**
 * Runs after a guest signs in: anything they added while anonymous is moved
 * onto the real account, then the guest cookie is cleared.
 */
export async function claimGuestWardrobeAction() {
  const session = await auth();
  if (!session?.user?.id) return { claimed: false };

  const store = await cookies();
  const token = store.get(GUEST_COOKIE)?.value;
  if (!token) return { claimed: false };

  const guestId = verifyGuestToken(token);
  if (!guestId) {
    store.delete(GUEST_COOKIE);
    return { claimed: false };
  }

  await claimGuestWardrobe(guestId, session.user.id);
  store.delete(GUEST_COOKIE);
  revalidatePath("/app", "layout");

  return { claimed: true };
}
