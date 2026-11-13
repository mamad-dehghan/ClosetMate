import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OutfitStudio } from "@/components/outfits/outfit-studio";
import { getOutfit } from "@/db/queries/outfits";
import { listItems } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";
import { sortPiecesByCategory } from "@/lib/outfits";

export const metadata = { title: "Edit outfit" };

export default async function EditOutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireActor();
  const { id } = await params;
  const [outfit, items] = await Promise.all([
    getOutfit(actor.userId, id),
    listItems(actor.userId),
  ]);

  if (!outfit) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href={`/app/outfits/${outfit.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to outfit
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Edit outfit</h1>
        <p className="mt-1 text-sm text-muted">{outfit.name}</p>
      </div>

      <OutfitStudio
        items={sortPiecesByCategory(items).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl,
          primaryColor: item.primaryColor,
        }))}
        outfit={{
          id: outfit.id,
          name: outfit.name,
          description: outfit.description,
          occasion: outfit.occasion,
          season: outfit.season,
          favorite: outfit.favorite,
          itemIds: outfit.pieces.map((piece) => piece.id),
        }}
      />
    </div>
  );
}
