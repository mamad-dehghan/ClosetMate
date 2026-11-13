"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { items } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { defaultItemName } from "@/lib/categories";
import { removeImage } from "@/lib/storage";
import { itemInputSchema } from "@/lib/validation";

export type ItemActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "top"),
    subcategory: String(formData.get("subcategory") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    primaryColor: String(formData.get("primaryColor") ?? ""),
    seasons: formData.getAll("seasons").map(String),
    occasions: formData.getAll("occasions").map(String),
    pattern: String(formData.get("pattern") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    purchasePrice: String(formData.get("purchasePrice") ?? ""),
    favorite: formData.get("favorite") === "on",
    laundryStatus: String(formData.get("laundryStatus") ?? "available"),
  };
}

function fallbackName(name: string, category: string, color?: string) {
  return name || defaultItemName(category, color);
}

function parse(formData: FormData) {
  const raw = readForm(formData);
  const result = itemInputSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false as const,
      state: {
        error: result.error.issues[0]?.message ?? "Please check the form.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true as const,
    data: {
      ...result.data,
      name: fallbackName(result.data.name, result.data.category, result.data.primaryColor),
      updatedAt: new Date(),
    },
  };
}

export async function createItemAction(
  _prev: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  const actor = await requireActor();
  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  let createdId: string | undefined;

  try {
    const [created] = await db
      .insert(items)
      .values({
        userId: actor.userId,
        name: parsed.data.name,
        category: parsed.data.category,
        subcategory: parsed.data.subcategory ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        primaryColor: parsed.data.primaryColor ?? null,
        secondaryColors: parsed.data.secondaryColors ?? [],
        seasons: parsed.data.seasons ?? [],
        occasions: parsed.data.occasions ?? [],
        pattern: parsed.data.pattern ?? null,
        brand: parsed.data.brand ?? null,
        notes: parsed.data.notes ?? null,
        purchasePrice: parsed.data.purchasePrice ?? null,
        favorite: parsed.data.favorite ?? false,
        laundryStatus: parsed.data.laundryStatus ?? "available",
      })
      .returning({ id: items.id });

    createdId = created?.id;
  } catch {
    return { error: "Could not save this item. Try again." };
  }

  revalidatePath("/app/wardrobe");
  revalidatePath("/app/today");

  if (createdId) redirect(`/app/wardrobe/${createdId}?created=1`);
  return {};
}

export async function updateItemAction(
  _prev: ItemActionState,
  formData: FormData,
): Promise<ItemActionState> {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing item id." };

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.state;

  const existing = await db.query.items.findFirst({
    where: and(eq(items.id, id), eq(items.userId, actor.userId)),
    columns: { id: true, imageUrl: true },
  });
  if (!existing) return { error: "That item is not in your wardrobe." };

  await db
    .update(items)
    .set({
      name: parsed.data.name,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory ?? null,
      imageUrl: parsed.data.imageUrl || existing.imageUrl,
      primaryColor: parsed.data.primaryColor ?? null,
      secondaryColors: parsed.data.secondaryColors ?? [],
      seasons: parsed.data.seasons ?? [],
      occasions: parsed.data.occasions ?? [],
      pattern: parsed.data.pattern ?? null,
      brand: parsed.data.brand ?? null,
      notes: parsed.data.notes ?? null,
      purchasePrice: parsed.data.purchasePrice ?? null,
      favorite: parsed.data.favorite ?? false,
      laundryStatus: parsed.data.laundryStatus ?? "available",
      updatedAt: new Date(),
    })
    .where(and(eq(items.id, id), eq(items.userId, actor.userId)));

  revalidatePath("/app/wardrobe");
  revalidatePath(`/app/wardrobe/${id}`);
  redirect(`/app/wardrobe/${id}?saved=1`);
}

export async function deleteItemAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await db.query.items.findFirst({
    where: and(eq(items.id, id), eq(items.userId, actor.userId)),
    columns: { id: true, imageUrl: true },
  });

  if (existing) {
    await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, actor.userId)));

    // Only user uploads live in our storage; sample illustrations are static.
    if (existing.imageUrl?.startsWith("/api/files/")) {
      await removeImage(existing.imageUrl);
    }
  }

  revalidatePath("/app/wardrobe");
  revalidatePath("/app/today");
  redirect("/app/wardrobe?deleted=1");
}

export async function toggleFavoriteAction(formData: FormData) {
  const actor = await requireActor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await db.query.items.findFirst({
    where: and(eq(items.id, id), eq(items.userId, actor.userId)),
    columns: { id: true, favorite: true },
  });
  if (!existing) return;

  await db
    .update(items)
    .set({ favorite: !existing.favorite, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, actor.userId)));

  revalidatePath("/app/wardrobe");
  revalidatePath(`/app/wardrobe/${id}`);
  revalidatePath("/app/today");
}
