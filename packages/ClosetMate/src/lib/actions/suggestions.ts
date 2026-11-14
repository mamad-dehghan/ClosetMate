"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { suggestionRejections } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { todayISO } from "@/lib/outfits";

function safeDay(value: FormDataEntryValue | null) {
  const day = String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : todayISO();
}

/** Remix: hide this exact combination for the rest of the day. */
export async function rejectSuggestionAction(formData: FormData) {
  const actor = await requireActor();
  const signature = String(formData.get("signature") ?? "").trim();
  if (!signature) return;

  const day = safeDay(formData.get("day"));

  await db
    .insert(suggestionRejections)
    .values({ userId: actor.userId, day, signature })
    .onConflictDoNothing();

  revalidatePath("/app/today");
}

/** Bring back every rejected idea for today. */
export async function resetSuggestionsAction(formData: FormData) {
  const actor = await requireActor();
  const day = safeDay(formData.get("day"));

  await db
    .delete(suggestionRejections)
    .where(
      and(
        eq(suggestionRejections.userId, actor.userId),
        eq(suggestionRejections.day, day),
      ),
    );

  revalidatePath("/app/today");
}
