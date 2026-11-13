import Link from "next/link";
import { Star } from "lucide-react";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { Badge } from "@/components/ui/badge";
import { toggleFavoriteAction } from "@/lib/actions/items";
import { categoryMeta, colorName } from "@/lib/categories";
import type { Item } from "@/db/schema";
import { cn } from "@/lib/utils";

export function ItemCard({ item }: { item: Item }) {
  const meta = categoryMeta(item.category);

  return (
    <div className="group relative">
      <Link
        href={`/app/wardrobe/${item.id}`}
        className="absolute inset-0 z-10 rounded-card"
        aria-label={`Open ${item.name}`}
      />

      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lift">
        <GarmentImage
          src={item.imageUrl}
          alt={item.name}
          imgClassName="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="px-3 pb-3 pt-2.5">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            {item.primaryColor ? (
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full border border-line"
                style={{ backgroundColor: item.primaryColor }}
              />
            ) : null}
            <span className="truncate">
              {colorName(item.primaryColor) ?? meta.singular}
            </span>
            {item.laundryStatus !== "available" ? (
              <Badge tone="warning" className="ml-auto px-1.5 py-0 text-[10px]">
                {item.laundryStatus === "laundry" ? "In wash" : "Repair"}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <form action={toggleFavoriteAction} className="absolute right-2 top-2 z-20">
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          aria-label={item.favorite ? "Remove from favourites" : "Add to favourites"}
          className={cn(
            "flex size-8 items-center justify-center rounded-full bg-canvas/85 text-muted backdrop-blur transition-colors hover:text-accent",
            item.favorite && "text-accent",
          )}
        >
          <Star
            className={cn("size-4", item.favorite && "fill-accent")}
            strokeWidth={1.9}
          />
        </button>
      </form>
    </div>
  );
}
