import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import {
  GUEST_COOKIE,
  createGuestUser,
  guestCookieOptions,
  signGuestToken,
  verifyGuestToken,
} from "@/lib/guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNext(value: string | null) {
  if (!value) return "/app/today";
  if (!value.startsWith("/app")) return "/app/today";
  if (value.startsWith("//")) return "/app/today";
  return value;
}

/**
 * Entry point for guest mode. Creates (or reuses) an anonymous wardrobe and
 * sets the signed cm_guest cookie, then continues to the requested app route.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));

  const store = await cookies();
  const existingId = verifyGuestToken(store.get(GUEST_COOKIE)?.value);

  let guestId = existingId;
  if (existingId) {
    const existing = await db.query.users.findFirst({
      where: eq(users.id, existingId),
      columns: { id: true, isAnonymous: true },
    });
    if (!existing?.isAnonymous) guestId = null;
  }

  if (!guestId) {
    const guest = await createGuestUser();
    guestId = guest.id;
  }

  const response = NextResponse.redirect(new URL(next, url.origin));
  response.cookies.set(GUEST_COOKIE, signGuestToken(guestId), guestCookieOptions);
  return response;
}
