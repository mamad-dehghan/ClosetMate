import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CapsuleEditor } from "@/components/capsules/capsule-editor";
import { getCapsule } from "@/db/queries/capsules";
import { countItems, listItems } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";
import { sortPiecesByCategory } from "@/lib/outfits";

export const metadata = { title: "Edit capsule" };

export default async function EditCapsulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireActor();
  const { id } = await params;

  const [capsule, items, { total }] = await Promise.all([
    getCapsule(actor.userId, id),
    listItems(actor.userId),
    countItems(actor.userId),
  ]);

  if (!capsule) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href={`/app/capsules/${capsule.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to capsule
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Edit capsule</h1>
        <p className="mt-1 text-sm text-muted">{capsule.name}</p>
      </div>

      <CapsuleEditor
        wardrobeTotal={total}
        items={sortPiecesByCategory(items).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl,
        }))}
        capsule={{
          id: capsule.id,
          name: capsule.name,
          description: capsule.description,
          season: capsule.season,
          occasion: capsule.occasion,
          itemIds: capsule.pieces.map((piece) => piece.id),
        }}
      />
    </div>
  );
}
