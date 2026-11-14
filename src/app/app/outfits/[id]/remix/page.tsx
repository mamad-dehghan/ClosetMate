import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OutfitRemix } from "@/components/outfits/outfit-remix";
import { getOutfit } from "@/db/queries/outfits";
import { listItems } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";
import { buildRemixSlots } from "@/lib/remix";

export const metadata = { title: "Remix outfit" };

export default async function RemixPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireActor();
  const { id } = await params;

  const [outfit, all] = await Promise.all([
    getOutfit(actor.userId, id),
    listItems(actor.userId),
  ]);

  if (!outfit) notFound();

  const slots = buildRemixSlots(outfit.pieces, all);

  const lite = (piece: (typeof all)[number]) => ({
    id: piece.id,
    name: piece.name,
    category: piece.category,
    imageUrl: piece.imageUrl,
    primaryColor: piece.primaryColor,
  });

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
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Remix</h1>
        <p className="mt-1 text-sm text-muted">
          Change one piece at a time. Alternatives are ranked by colour harmony
          with the rest of the outfit.
        </p>
      </div>

      <OutfitRemix
        outfit={{
          id: outfit.id,
          name: outfit.name,
          occasion: outfit.occasion,
          season: outfit.season,
        }}
        slots={slots.map((slot) => ({
          base: lite(slot.base),
          alternatives: slot.alternatives.map((alternative) => ({
            item: lite(alternative.item),
            score: alternative.score,
            label: alternative.label,
          })),
        }))}
      />
    </div>
  );
}
