"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { outfitPlans, outfitWears, outfits } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { todayISO } from "@/lib/outfits";
import { persistOutfit } from "@/lib/outfits-persist";
import {
  outfitInputSchema,
  outfitPlanSchema,
  outfitWearSchema,
} from "@/lib/validation";

export type OutfitActionState = { error?: string };

function revalidateOutfits(id?: string) {
  revalidatePath("/app/outfits");
  revalidatePath("/app/calendar");
  revalidatePath("/app/today");
  revalidatePath("/app/wardrobe");
  if (id) {
    revalidatePath(`/app/outfits/${id}`);
    revalidatePath(`/app/outfits/${id}/edit`);
  }
}

export async function saveOutfitAction(
  _prev: OutfitActionState,
  formData: FormData,
): Promise<OutfitActionState> {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim();

  const parsed = outfitInputSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    occasion: String(formData.get("occasion") ?? ""),
    season: String(formData.get("season") ?? ""),
    favorite: formData.get("favorite") === "on",
    itemIds: [...new Set(formData.getAll("itemIds").map(String))],
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the outfit details.",
    };
  }

  const result = await persistOutfit(
    actor.userId,
    parsed.data,
    id || undefined,
  );

  if ("error" in result) return { error: result.error };

  revalidateOutfits(result.id);
  redirect(`/app/outfits/${result.id}?saved=1`);
}

export async function deleteOutfitAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(outfits)
    .where(and(eq(outfits.id, id), eq(outfits.userId, actor.userId)));

  revalidateOutfits(id);
  redirect("/app/outfits?deleted=1");
}

export async function toggleOutfitFavoriteAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await db.query.outfits.findFirst({
    where: and(eq(outfits.id, id), eq(outfits.userId, actor.userId)),
    columns: { id: true, favorite: true },
  });
  if (!existing) return;

  await db
    .update(outfits)
    .set({ favorite: !existing.favorite, updatedAt: new Date() })
    .where(and(eq(outfits.id, id), eq(outfits.userId, actor.userId)));

  revalidateOutfits(id);
}

export async function markOutfitWornAction(formData: FormData) {
  const actor = await requireActor();

  const parsed = outfitWearSchema.safeParse({
    outfitId: String(formData.get("outfitId") ?? ""),
    wornOn: String(formData.get("wornOn") ?? todayISO()),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) return;

  const outfit = await db.query.outfits.findFirst({
    where: and(
      eq(outfits.id, parsed.data.outfitId),
      eq(outfits.userId, actor.userId),
    ),
    columns: { id: true },
  });
  if (!outfit) return;

  const existing = await db.query.outfitWears.findFirst({
    where: and(
      eq(outfitWears.userId, actor.userId),
      eq(outfitWears.outfitId, parsed.data.outfitId),
      eq(outfitWears.wornOn, parsed.data.wornOn),
    ),
    columns: { id: true },
  });

  if (!existing) {
    await db.insert(outfitWears).values({
      userId: actor.userId,
      outfitId: parsed.data.outfitId,
      wornOn: parsed.data.wornOn,
      note: parsed.data.note ?? null,
    });
  }

  revalidateOutfits(parsed.data.outfitId);
}

export async function planOutfitAction(formData: FormData) {
  const actor = await requireActor();

  const parsed = outfitPlanSchema.safeParse({
    outfitId: String(formData.get("outfitId") ?? ""),
    plannedFor: String(formData.get("plannedFor") ?? todayISO()),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) return;

  const outfit = await db.query.outfits.findFirst({
    where: and(
      eq(outfits.id, parsed.data.outfitId),
      eq(outfits.userId, actor.userId),
    ),
    columns: { id: true, occasion: true },
  });
  if (!outfit) return;

  await db.transaction(async (tx) => {
    await tx
      .delete(outfitPlans)
      .where(
        and(
          eq(outfitPlans.userId, actor.userId),
          eq(outfitPlans.plannedFor, parsed.data.plannedFor),
        ),
      );

    await tx.insert(outfitPlans).values({
      userId: actor.userId,
      outfitId: parsed.data.outfitId,
      plannedFor: parsed.data.plannedFor,
      occasion: outfit.occasion,
      note: parsed.data.note ?? null,
    });
  });

  revalidateOutfits(parsed.data.outfitId);
  revalidatePath(`/app/calendar`);
}

export async function removePlanAction(formData: FormData) {
  const actor = await requireActor();
  const planId = String(formData.get("planId") ?? "");
  if (!planId) return;

  await db
    .delete(outfitPlans)
    .where(
      and(eq(outfitPlans.id, planId), eq(outfitPlans.userId, actor.userId)),
    );

  revalidatePath("/app/calendar");
  revalidatePath("/app/today");
}
