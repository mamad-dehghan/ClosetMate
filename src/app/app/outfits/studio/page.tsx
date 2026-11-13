import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OutfitStudio } from "@/components/outfits/outfit-studio";
import { listItems } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";
import { sortPiecesByCategory } from "@/lib/outfits";

export const metadata = { title: "New outfit" };

export default async function OutfitStudioPage() {
  const actor = await requireActor();
  const items = await listItems(actor.userId);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href="/app/outfits"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Outfits
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Outfit studio</h1>
        <p className="mt-1 text-sm text-muted">
          Pick pieces from your wardrobe. Two or three is usually enough.
        </p>
      </div>

      <OutfitStudio
        items={sortPiecesByCategory(items).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl,
          primaryColor: item.primaryColor,
        }))}
      />
    </div>
  );
}
