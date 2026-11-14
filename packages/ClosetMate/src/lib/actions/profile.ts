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

export type LocationState = { ok: boolean; error?: string };

function validCoords(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function saveLocationAction(
  latitude: number,
  longitude: number,
  label?: string,
): Promise<LocationState> {
  const actor = await requireActor();

  if (!validCoords(latitude, longitude)) {
    return { ok: false, error: "Those coordinates look wrong." };
  }

  const locationLabel = (label ?? "").trim().slice(0, 60) || null;

  await db
    .insert(preferences)
    .values({
      userId: actor.userId,
      latitude,
      longitude,
      locationLabel,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: preferences.userId,
      set: { latitude, longitude, locationLabel, updatedAt: new Date() },
    });

  revalidatePath("/app/today");
  revalidatePath("/app/profile");
  return { ok: true };
}

export async function clearLocationAction(): Promise<LocationState> {
  const actor = await requireActor();

  await db
    .update(preferences)
    .set({
      latitude: null,
      longitude: null,
      locationLabel: null,
      updatedAt: new Date(),
    })
    .where(eq(preferences.userId, actor.userId));

  revalidatePath("/app/today");
  revalidatePath("/app/profile");
  return { ok: true };
}

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
