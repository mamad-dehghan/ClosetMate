import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Pencil,
  Shuffle,
  Sparkles,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteOutfitButton } from "@/components/outfits/delete-outfit-button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import {
  getOutfit,
  planForDate,
  wearInfoForOutfit,
} from "@/db/queries/outfits";
import { requireActor } from "@/lib/actor";
import {
  markOutfitWornAction,
  planOutfitAction,
  toggleOutfitFavoriteAction,
} from "@/lib/actions/outfits";
import { OCCASIONS, SEASONS, categoryMeta } from "@/lib/categories";
import { formatDayLabel, outfitHarmony, todayISO } from "@/lib/outfits";

export default async function OutfitDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireActor();
  const { id } = await params;
  const query = await searchParams;
  const today = todayISO();

  const [outfit, wear, todaysPlan] = await Promise.all([
    getOutfit(actor.userId, id),
    wearInfoForOutfit(actor.userId, id),
    planForDate(actor.userId, today),
  ]);

  if (!outfit) notFound();

  const harmony = outfitHarmony(outfit.pieces);
  const occasion = OCCASIONS.find((entry) => entry.value === outfit.occasion);
  const season = SEASONS.find((entry) => entry.value === outfit.season);
  const plannedToday = todaysPlan?.outfit.id === outfit.id;
  const wornToday = wear.lastWorn === today;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/app/outfits"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Outfits
        </Link>
        <div className="flex items-center gap-1.5">
          <form action={toggleOutfitFavoriteAction}>
            <input type="hidden" name="id" value={outfit.id} />
            <button
              type="submit"
              aria-label={
                outfit.favorite
                  ? "Remove from favourites"
                  : "Add to favourites"
              }
              className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-accent"
            >
              <Star
                className={outfit.favorite ? "size-4 fill-accent text-accent" : "size-4"}
              />
            </button>
          </form>
          <Link
            href={`/app/outfits/${outfit.id}/remix`}
            className={buttonVariants({ variant: "soft", size: "sm" })}
          >
            <Shuffle className="size-4" />
            Remix
          </Link>
          <Link
            href={`/app/outfits/${outfit.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <DeleteOutfitButton id={outfit.id} name={outfit.name} />
        </div>
      </div>

      {query.saved === "1" ? (
        <p className="rounded-2xl border border-sage/30 bg-sage-soft px-4 py-3 text-sm text-sage">
          Outfit saved.
        </p>
      ) : null}

      <header>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="neutral">
            {outfit.pieces.length} piece
            {outfit.pieces.length === 1 ? "" : "s"}
          </Badge>
          {occasion ? <Badge tone="accent">{occasion.label}</Badge> : null}
          {season ? <Badge tone="outline">{season.label}</Badge> : null}
          {outfit.favorite ? <Badge tone="sage">Favourite</Badge> : null}
          {plannedToday ? <Badge tone="sage">Planned today</Badge> : null}
        </div>
        <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
          {outfit.name}
        </h1>
        {outfit.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {outfit.description}
          </p>
        ) : null}
      </header>

      {/* Pieces */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        {outfit.pieces.map((piece) => (
          <Link
            key={piece.id}
            href={`/app/wardrobe/${piece.id}`}
            className="group"
          >
            <GarmentImage
              src={piece.imageUrl}
              alt={piece.name}
              imgClassName="object-cover transition-transform group-hover:scale-[1.02]"
            />
            <p className="mt-1.5 truncate text-xs text-muted">
              {categoryMeta(piece.category).singular}
            </p>
          </Link>
        ))}
      </section>

      {/* Harmony + wear stats */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-accent" />
              Colour harmony
            </h2>
            <span className="font-display text-2xl">{harmony.score}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(harmony.score, 4)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-medium">{harmony.label}</p>
          <p className="mt-1 text-sm text-muted">{harmony.detail}</p>
        </div>

        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <h2 className="text-sm font-semibold">Wear history</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Times worn</dt>
              <dd className="font-medium">{wear.wears}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Last worn</dt>
              <dd className="text-right font-medium">
                {wear.lastWorn ? formatDayLabel(wear.lastWorn) : "Never"}
              </dd>
            </div>
          </dl>
          {wornToday ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-sage-soft px-2.5 py-1 text-xs text-sage">
              <Check className="size-3" />
              Worn today
            </p>
          ) : null}
        </div>
      </section>

      {/* Actions */}
      <section className="grid gap-3 sm:grid-cols-2">
        <form
          action={markOutfitWornAction}
          className="rounded-card border border-line bg-surface p-4 shadow-card"
        >
          <input type="hidden" name="outfitId" value={outfit.id} />
          <h2 className="text-sm font-semibold">Wear this outfit</h2>
          <p className="mt-1 text-xs text-muted">
            Records the date so it shows up in your history.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="date"
              name="wornOn"
              defaultValue={today}
              className="h-10 flex-1 rounded-xl border border-line bg-canvas px-3 text-sm"
            />
            <button type="submit" className={buttonVariants({ size: "sm" })}>
              Mark worn
            </button>
          </div>
        </form>

        <form
          action={planOutfitAction}
          className="rounded-card border border-line bg-surface p-4 shadow-card"
        >
          <input type="hidden" name="outfitId" value={outfit.id} />
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="size-4 text-sage" />
            Plan it
          </h2>
          <p className="mt-1 text-xs text-muted">
            Assign this outfit to a day. It replaces any plan already there.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="date"
              name="plannedFor"
              defaultValue={today}
              className="h-10 flex-1 rounded-xl border border-line bg-canvas px-3 text-sm"
            />
            <button
              type="submit"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Plan
            </button>
          </div>
          {plannedToday && todaysPlan ? (
            <p className="mt-3 text-xs text-sage">
              Planned for today.{" "}
              <Link href="/app/calendar" className="underline">
                See calendar
              </Link>
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
