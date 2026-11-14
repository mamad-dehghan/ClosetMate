"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { capsuleItems, capsules, items } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { capsuleInputSchema } from "@/lib/validation";

export type CapsuleActionState = { error?: string };

function revalidateCapsules(id?: string) {
  revalidatePath("/app/capsules");
  revalidatePath("/app/profile");
  revalidatePath("/app/challenges");
  if (id) revalidatePath(`/app/capsules/${id}`);
}

export async function saveCapsuleAction(
  _prev: CapsuleActionState,
  formData: FormData,
): Promise<CapsuleActionState> {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "").trim();

  const parsed = capsuleInputSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    season: String(formData.get("season") ?? ""),
    occasion: String(formData.get("occasion") ?? ""),
    itemIds: [...new Set(formData.getAll("itemIds").map(String))],
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the capsule." };
  }

  const owned = await db
    .select({ id: items.id })
    .from(items)
    .where(
      and(
        eq(items.userId, actor.userId),
        inArray(items.id, parsed.data.itemIds),
      ),
    );

  if (owned.length !== parsed.data.itemIds.length) {
    return { error: "Some pieces are no longer in your wardrobe." };
  }

  const values = {
    name: parsed.data.name || "My capsule",
    description: parsed.data.description ?? null,
    season: parsed.data.season ?? null,
    occasion: parsed.data.occasion ?? null,
    updatedAt: new Date(),
  };

  let capsuleId = id;

  try {
    if (id) {
      const existing = await db.query.capsules.findFirst({
        where: and(eq(capsules.id, id), eq(capsules.userId, actor.userId)),
        columns: { id: true },
      });
      if (!existing) return { error: "That capsule is not in your wardrobe." };

      await db.transaction(async (tx) => {
        await tx
          .update(capsules)
          .set(values)
          .where(and(eq(capsules.id, id), eq(capsules.userId, actor.userId)));
        await tx.delete(capsuleItems).where(eq(capsuleItems.capsuleId, id));
        await tx.insert(capsuleItems).values(
          parsed.data.itemIds.map((itemId, position) => ({
            capsuleId: id,
            itemId,
            position,
          })),
        );
      });
    } else {
      const [created] = await db
        .insert(capsules)
        .values({ ...values, userId: actor.userId })
        .returning({ id: capsules.id });

      if (!created) return { error: "Could not save this capsule." };
      capsuleId = created.id;

      await db.insert(capsuleItems).values(
        parsed.data.itemIds.map((itemId, position) => ({
          capsuleId: created.id,
          itemId,
          position,
        })),
      );
    }
  } catch {
    return { error: "Could not save this capsule. Try again." };
  }

  revalidateCapsules(capsuleId);
  redirect(`/app/capsules/${capsuleId}?saved=1`);
}

export async function deleteCapsuleAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(capsules)
    .where(and(eq(capsules.id, id), eq(capsules.userId, actor.userId)));

  revalidateCapsules(id);
  redirect("/app/capsules?deleted=1");
}

/** Used by the packing assistant to keep a generated list. */
export async function savePackingCapsuleAction(formData: FormData) {
  const actor = await requireActor();
  const name = String(formData.get("name") ?? "").trim() || "Packing list";
  const itemIds = [...new Set(formData.getAll("itemIds").map(String))];

  if (itemIds.length === 0) return;

  const owned = await db
    .select({ id: items.id })
    .from(items)
    .where(
      and(eq(items.userId, actor.userId), inArray(items.id, itemIds)),
    );

  if (owned.length !== itemIds.length) return;

  const [created] = await db
    .insert(capsules)
    .values({ userId: actor.userId, name: name.slice(0, 80) })
    .returning({ id: capsules.id });

  if (!created) return;

  await db.insert(capsuleItems).values(
    itemIds.map((itemId, position) => ({
      capsuleId: created.id,
      itemId,
      position,
    })),
  );

  revalidateCapsules(created.id);
  redirect(`/app/capsules/${created.id}?saved=1`);
}
