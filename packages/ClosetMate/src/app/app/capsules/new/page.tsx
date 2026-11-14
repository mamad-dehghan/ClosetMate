import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CapsuleEditor } from "@/components/capsules/capsule-editor";
import { countItems, listItems } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";
import { sortPiecesByCategory } from "@/lib/outfits";

export const metadata = { title: "New capsule" };

export default async function NewCapsulePage() {
  const actor = await requireActor();
  const [items, { total }] = await Promise.all([
    listItems(actor.userId),
    countItems(actor.userId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href="/app/capsules"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Capsules
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">New capsule</h1>
        <p className="mt-1 text-sm text-muted">
          Pick a small set that can be combined into complete outfits.
        </p>
      </div>

      <CapsuleEditor
        wardrobeTotal={total}
        items={sortPiecesByCategory(items).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl,
        }))}
      />
    </div>
  );
}
