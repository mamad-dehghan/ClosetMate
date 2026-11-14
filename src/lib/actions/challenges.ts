"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { challengeCompletions } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { todayISO } from "@/lib/outfits";

const KEYS = new Set(["wear-three", "fresh-outfit", "build-capsule"]);

export async function completeChallengeAction(formData: FormData) {
  const actor = await requireActor();
  const key = String(formData.get("key") ?? "");

  if (!KEYS.has(key)) return;

  await db
    .insert(challengeCompletions)
    .values({ userId: actor.userId, key, completedOn: todayISO() })
    .onConflictDoNothing();

  revalidatePath("/app/challenges");
}
