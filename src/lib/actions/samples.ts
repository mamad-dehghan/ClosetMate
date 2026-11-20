"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/lib/actor";
import { seedWardrobe } from "@/lib/seed";

export type FillSamplesState = { filled?: number; error?: string };

/**
 * Adds the twelve sample pieces to an empty closet. Safe to call more than
 * once: seedWardrobe() returns 0 when the closet already has items.
 */
export async function fillSampleWardrobeAction(
  _prev: FillSamplesState,
  _formData: FormData,
): Promise<FillSamplesState> {
  const actor = await requireActor();
  const filled = await seedWardrobe(actor.userId);

  if (filled === 0) {
    return { error: "Your closet already has pieces." };
  }

  revalidatePath("/app/wardrobe");
  revalidatePath("/app/today");
  revalidatePath("/app/insights");

  return { filled };
}
