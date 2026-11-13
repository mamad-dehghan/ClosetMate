import Link from "next/link";
import { Plus, Shirt } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ItemCard } from "@/components/wardrobe/item-card";
import { WardrobeFilters } from "@/components/wardrobe/wardrobe-filters";
import { countItems, listItems } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";
import { itemFiltersSchema } from "@/lib/validation";

export const metadata = { title: "My wardrobe" };

export default async function WardrobePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireActor();
  const raw = await searchParams;
  const get = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string) : undefined;

  const filters = itemFiltersSchema.parse({
    q: get("q"),
    category: get("category"),
    season: get("season"),
    occasion: get("occasion"),
    favorite: get("favorite"),
    sort: get("sort"),
  });

  const [items, { counts, total }] = await Promise.all([
    listItems(actor.userId, filters),
    countItems(actor.userId),
  ]);

  const filtered = Boolean(
    filters.q ||
      filters.category ||
      filters.season ||
      filters.occasion ||
      filters.favorite,
  );

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">My wardrobe</h1>
          <p className="mt-1 text-sm text-muted">
            {total === 0
              ? "Nothing here yet."
              : `${total} piece${total === 1 ? "" : "s"} · ${counts.top} tops · ${counts.bottom} bottoms`}
          </p>
        </div>
        <Link
          href="/app/wardrobe/new"
          className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}
        >
          <Plus className="size-4" />
          Add
        </Link>
      </header>

      {total === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <Shirt className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl">Add three pieces to begin</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            A top, a bottom and shoes are enough for ClosetMate to start
            suggesting combinations.
          </p>
          <Link
            href="/app/wardrobe/new"
            className={`${buttonVariants({ size: "md" })} mt-6`}
          >
            <Plus className="size-4" />
            Add your first piece
          </Link>
        </div>
      ) : (
        <>
          <WardrobeFilters counts={counts} total={total} />

          {raw.deleted === "1" ? (
            <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
              Item deleted.
            </p>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-surface/60 px-5 py-12 text-center">
              <h2 className="font-display text-xl">Nothing matches those filters</h2>
              <p className="mt-2 text-sm text-muted">
                Try clearing a filter or searching for something else.
              </p>
              <Link
                href="/app/wardrobe"
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-5`}
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {filtered ? (
            <p className="text-center text-xs text-muted">
              Showing {items.length} of {total} pieces
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
