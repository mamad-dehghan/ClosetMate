"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { preferences, users } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { auth, signOut } from "@/lib/auth";
import { GUEST_COOKIE } from "@/lib/guest";

export type PreferencesState = { error?: string; saved?: boolean };

export async function updatePreferencesAction(
  _prev: PreferencesState,
  formData: FormData,
): Promise<PreferencesState> {
  const actor = await requireActor();

  const currency = String(formData.get("currency") ?? "USD").slice(0, 3);
  const units = String(formData.get("units") ?? "metric");
  const theme = String(formData.get("theme") ?? "system");

  if (!["USD", "EUR", "GBP", "PLN", "CAD", "AUD"].includes(currency)) {
    return { error: "Pick a supported currency." };
  }

  const updated = await db
    .update(preferences)
    .set({ currency, units, theme, updatedAt: new Date() })
    .where(eq(preferences.userId, actor.userId))
    .returning({ userId: preferences.userId });

  if (updated.length === 0) {
    await db.insert(preferences).values({ userId: actor.userId, currency, units, theme });
  }

  revalidatePath("/app/profile");
  return { saved: true };
}

export async function deleteAccountAction() {
  const actor = await requireActor();
  const session = await auth();

  await db.delete(users).where(eq(users.id, actor.userId));

  const store = await cookies();
  store.delete(GUEST_COOKIE);

  if (session?.user?.id) {
    await signOut({ redirectTo: "/" });
    return;
  }

  redirect("/");
}
