import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ItemForm } from "@/components/wardrobe/item-form";
import { getItem } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";

export const metadata = { title: "Edit item" };

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireActor();
  const { id } = await params;
  const item = await getItem(actor.userId, id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href={`/app/wardrobe/${item.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to item
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Edit item</h1>
        <p className="mt-1 text-sm text-muted">{item.name}</p>
      </div>
      <ItemForm
        mode="edit"
        item={{
          id: item.id,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          imageUrl: item.imageUrl,
          primaryColor: item.primaryColor,
          seasons: item.seasons,
          occasions: item.occasions,
          pattern: item.pattern,
          brand: item.brand,
          notes: item.notes,
          purchasePrice: item.purchasePrice,
          favorite: item.favorite,
          laundryStatus: item.laundryStatus,
        }}
      />
    </div>
  );
}
