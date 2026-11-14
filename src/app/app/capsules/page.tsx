import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { countItems } from "@/db/queries/items";
import { listCapsules } from "@/db/queries/capsules";
import { requireActor } from "@/lib/actor";
import { capsuleSummary } from "@/lib/capsules";
import { sortPiecesByCategory } from "@/lib/outfits";

export const metadata = { title: "Capsules" };

export default async function CapsulesPage() {
  const actor = await requireActor();
  const [capsules, { total }] = await Promise.all([
    listCapsules(actor.userId),
    countItems(actor.userId),
  ]);

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Capsules</h1>
          <p className="mt-1 text-sm text-muted">
            Small, wearable subsets of your wardrobe.
          </p>
        </div>
        <Link
          href="/app/capsules/new"
          className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}
        >
          <Plus className="size-4" />
          New capsule
        </Link>
      </header>

      {capsules.length === 0 ? (
        <section className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <Package className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl">Build a capsule</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Ten pieces that work together beat a full closet you cannot combine.
            Start with what you already own.
          </p>
          <Link
            href="/app/capsules/new"
            className={`${buttonVariants({ size: "md" })} mt-6`}
          >
            <Plus className="size-4" />
            Create a capsule
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {capsules.map((capsule) => {
            const summary = capsuleSummary(capsule.pieces, total);
            const cover = sortPiecesByCategory(capsule.pieces).slice(0, 4);

            return (
              <Link
                key={capsule.id}
                href={`/app/capsules/${capsule.id}`}
                className="group overflow-hidden rounded-card border border-line bg-surface p-2.5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="grid grid-cols-4 gap-1">
                  {cover.length > 0 ? (
                    cover.map((piece) => (
                      <GarmentImage
                        key={piece.id}
                        src={piece.imageUrl}
                        alt={piece.name}
                        ratio="aspect-[4/5]"
                        className="rounded-lg"
                      />
                    ))
                  ) : (
                    <div className="col-span-4 flex aspect-[5/1] items-center justify-center rounded-lg bg-surface-2 text-xs text-muted">
                      Empty capsule
                    </div>
                  )}
                </div>
                <div className="px-1 pb-1 pt-3">
                  <p className="truncate text-sm font-medium">{capsule.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {summary.total} piece{summary.total === 1 ? "" : "s"} ·{" "}
                    {summary.coverage}% coverage · {summary.capacity} outfits
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
