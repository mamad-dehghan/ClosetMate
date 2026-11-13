import Link from "next/link";
import { CalendarDays, Layers, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { OutfitCard } from "@/components/outfits/outfit-card";
import { listOutfits, wearInfoByOutfit } from "@/db/queries/outfits";
import { requireActor } from "@/lib/actor";
import { OCCASIONS } from "@/lib/categories";

export const metadata = { title: "Outfits" };

export default async function OutfitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireActor();
  const raw = await searchParams;
  const occasion = typeof raw.occasion === "string" ? raw.occasion : "";
  const favorite = raw.favorite === "1";

  const [outfits, wearMap] = await Promise.all([
    listOutfits(actor.userId, { favorite, occasion }),
    wearInfoByOutfit(actor.userId),
  ]);

  const hasFilter = Boolean(occasion || favorite);

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Outfits</h1>
          <p className="mt-1 text-sm text-muted">
            {outfits.length === 0
              ? "No saved combinations yet."
              : `${outfits.length} saved combination${outfits.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/app/outfits/studio"
          className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}
        >
          <Plus className="size-4" />
          New outfit
        </Link>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
        <FilterChip href="/app/outfits" active={!hasFilter}>
          All
        </FilterChip>
        <FilterChip
          href="/app/outfits?favorite=1"
          active={favorite && !occasion}
        >
          Favourites
        </FilterChip>
        {OCCASIONS.map((entry) => (
          <FilterChip
            key={entry.value}
            href={`/app/outfits?occasion=${entry.value}`}
            active={occasion === entry.value}
          >
            {entry.label}
          </FilterChip>
        ))}
      </div>

      {raw.deleted === "1" ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          Outfit deleted.
        </p>
      ) : null}

      {outfits.length === 0 ? (
        <section className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <Layers className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl">
            {hasFilter ? "Nothing matches that filter" : "Build your first outfit"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            {hasFilter
              ? "Try another occasion or clear the filters."
              : "Pick pieces from your wardrobe, see the colour harmony, and save it for later."}
          </p>
          <Link
            href={hasFilter ? "/app/outfits" : "/app/outfits/studio"}
            className={`${buttonVariants({ size: "md" })} mt-6`}
          >
            {hasFilter ? (
              "Clear filters"
            ) : (
              <>
                <Plus className="size-4" />
                Create an outfit
              </>
            )}
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              wear={wearMap.get(outfit.id)}
            />
          ))}
        </div>
      )}

      <Link
        href="/app/calendar"
        className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-sage">
          <CalendarDays className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">Plan the week</p>
          <p className="truncate text-xs text-muted">
            Assign outfits to dates in the calendar.
          </p>
        </div>
      </Link>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "shrink-0 rounded-pill border border-ink bg-ink px-3.5 py-2 text-sm text-canvas"
          : "shrink-0 rounded-pill border border-line bg-surface px-3.5 py-2 text-sm text-muted hover:text-ink"
      }
    >
      {children}
    </Link>
  );
}
