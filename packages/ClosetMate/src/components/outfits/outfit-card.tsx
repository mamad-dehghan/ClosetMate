import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { toggleOutfitFavoriteAction } from "@/lib/actions/outfits";
import { sortPiecesByCategory } from "@/lib/outfits";
import type { OutfitWithPieces, WearInfo } from "@/db/queries/outfits";
import { cn } from "@/lib/utils";

function Cover({ pieces }: { pieces: OutfitWithPieces["pieces"] }) {
  const sorted = sortPiecesByCategory(pieces);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[18px] bg-surface-2 text-xs text-muted">
        No pieces
      </div>
    );
  }

  if (sorted.length === 1) {
    const only = sorted[0]!;
    return (
      <GarmentImage
        src={only.imageUrl}
        alt={only.name}
        ratio="aspect-[4/3]"
        imgClassName="object-cover"
      />
    );
  }

  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-[18px] bg-surface-2">
      {sorted.slice(0, 4).map((piece, index) => (
        <div
          key={piece.id}
          className={cn(
            "relative overflow-hidden",
            sorted.length === 2 && "row-span-2",
            sorted.length === 3 && index === 0 && "row-span-2",
          )}
        >
          <GarmentImage
            src={piece.imageUrl}
            alt={piece.name}
            ratio="size-full"
            className="rounded-none"
            imgClassName="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function OutfitCard({
  outfit,
  wear,
}: {
  outfit: OutfitWithPieces;
  wear?: WearInfo;
}) {
  return (
    <div className="group relative">
      <Link
        href={`/app/outfits/${outfit.id}`}
        className="absolute inset-0 z-10 rounded-card"
        aria-label={`Open ${outfit.name}`}
      />

      <div className="overflow-hidden rounded-card border border-line bg-surface p-2.5 shadow-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lift">
        <Cover pieces={outfit.pieces} />
        <div className="px-1 pb-1 pt-2.5">
          <p className="truncate text-sm font-medium">{outfit.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <span>
              {outfit.pieces.length} piece
              {outfit.pieces.length === 1 ? "" : "s"}
            </span>
            {outfit.occasion ? <Badge tone="outline">{outfit.occasion}</Badge> : null}
          </div>
          {wear && wear.wears > 0 ? (
            <p className="mt-1 text-[11px] text-muted">
              Worn {wear.wears}×{wear.lastWorn ? ` · last ${wear.lastWorn}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      <form
        action={toggleOutfitFavoriteAction}
        className="absolute right-3.5 top-3.5 z-20"
      >
        <input type="hidden" name="id" value={outfit.id} />
        <button
          type="submit"
          aria-label={
            outfit.favorite ? "Remove from favourites" : "Add to favourites"
          }
          className={cn(
            "flex size-8 items-center justify-center rounded-full bg-canvas/85 text-muted backdrop-blur transition-colors hover:text-accent",
            outfit.favorite && "text-accent",
          )}
        >
          <Star
            className={cn("size-4", outfit.favorite && "fill-accent")}
            strokeWidth={1.9}
          />
        </button>
      </form>
    </div>
  );
}
