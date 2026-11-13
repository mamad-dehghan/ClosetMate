import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Layers,
  Plus,
  Shirt,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { ItemCard } from "@/components/wardrobe/item-card";
import { countItems, favoriteItems, listItems, recentItems } from "@/db/queries/items";
import { planForDate, wearsThisMonth } from "@/db/queries/outfits";
import { requireActor } from "@/lib/actor";
import { markOutfitWornAction } from "@/lib/actions/outfits";
import { categoryMeta, OCCASIONS } from "@/lib/categories";
import { todayISO } from "@/lib/outfits";
import { countsFromItems, outfitCapacity } from "@/lib/versatility";
import { suggestOutfit } from "@/lib/suggest";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const actor = await requireActor();
  const iso = todayISO();
  const month = iso.slice(0, 7);

  const [all, { counts, total }, recent, favorites, plan, wornThisMonth] =
    await Promise.all([
      listItems(actor.userId),
      countItems(actor.userId),
      recentItems(actor.userId, 6),
      favoriteItems(actor.userId, 4),
      planForDate(actor.userId, iso),
      wearsThisMonth(actor.userId, month),
    ]);

  const suggestion = suggestOutfit(all);
  const capacity = outfitCapacity(countsFromItems(all));
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {today}
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Today</h1>
        <p className="mt-1 text-sm text-muted">
          {total === 0
            ? "Your wardrobe is empty — add a few pieces to get started."
            : `You can build about ${capacity} complete outfit${capacity === 1 ? "" : "s"} right now.`}
        </p>
      </header>

      {/* Planned outfit */}
      {plan ? (
        <section className="overflow-hidden rounded-card border border-sage/30 bg-surface shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-sage" />
              <h2 className="text-sm font-semibold">Planned for today</h2>
            </div>
            {plan.occasion ? (
              <Badge tone="sage">
                {OCCASIONS.find((entry) => entry.value === plan.occasion)?.label ??
                  plan.occasion}
              </Badge>
            ) : (
              <Badge tone="sage">
                {plan.pieces.length} piece{plan.pieces.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4 sm:gap-3">
            {plan.pieces.slice(0, 4).map((piece) => (
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
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line/70 px-5 py-3">
            <Link
              href={`/app/outfits/${plan.outfit.id}`}
              className="min-w-0 truncate text-sm font-medium hover:underline"
            >
              {plan.outfit.name}
            </Link>
            <form action={markOutfitWornAction} className="shrink-0">
              <input type="hidden" name="outfitId" value={plan.outfit.id} />
              <input type="hidden" name="wornOn" value={iso} />
              <button
                type="submit"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Check className="size-4" />
                Mark worn
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {/* Suggestion */}
      {suggestion ? (
        <section className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <h2 className="text-sm font-semibold">
                {plan ? "Or something else" : "An idea for today"}
              </h2>
            </div>
            <Badge tone="accent">{suggestion.score} · {suggestion.label}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4 sm:gap-3">
            {suggestion.items.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/app/wardrobe/${item.id}`}
                className="group"
              >
                <GarmentImage
                  src={item.imageUrl}
                  alt={item.name}
                  imgClassName="object-cover transition-transform group-hover:scale-[1.02]"
                />
                <p className="mt-1.5 truncate text-xs text-muted">
                  {categoryMeta(item.category).singular}
                </p>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line/70 px-5 py-3">
            <p className="text-xs text-muted">
              Picked from available pieces by colour harmony.
            </p>
            <Link
              href="/app/wardrobe"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Remix
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-card border border-dashed border-line bg-surface/60 px-5 py-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <Shirt className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl">Your first outfit starts here</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Add a top, a bottom and a pair of shoes. That is enough for a
            suggestion.
          </p>
          <Link
            href="/app/wardrobe/new"
            className={`${buttonVariants({ size: "md" })} mt-5`}
          >
            <Plus className="size-4" />
            Add clothing
          </Link>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {[
          { label: "Pieces", value: total, icon: Shirt, href: "/app/wardrobe" },
          { label: "Outfits possible", value: capacity, icon: TrendingUp, href: "/app/wardrobe" },
          { label: "Worn this month", value: wornThisMonth, icon: Check, href: "/app/calendar" },
          { label: "Favourites", value: favorites.length, icon: Star, href: "/app/wardrobe?favorite=1" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-card border border-line bg-surface px-4 py-4 shadow-card"
          >
            <stat.icon className="size-4 text-muted" />
            <p className="mt-2 font-display text-2xl">{stat.value}</p>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
              {stat.label}
            </p>
          </Link>
        ))}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          Do something
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-3">
          <Link
            href="/app/wardrobe/new"
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-ink/20"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Camera className="size-4" />
            </span>
            <span className="text-sm font-medium">Add clothing</span>
            <ArrowRight className="ml-auto size-4 text-muted" />
          </Link>
          <Link
            href="/app/wardrobe"
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-ink/20"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-sage">
              <Shirt className="size-4" />
            </span>
            <span className="text-sm font-medium">Browse wardrobe</span>
            <ArrowRight className="ml-auto size-4 text-muted" />
          </Link>
          <Link
            href="/app/outfits"
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-ink/20"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Layers className="size-4" />
            </span>
            <span className="text-sm font-medium">Build an outfit</span>
            <ArrowRight className="ml-auto size-4 text-muted" />
          </Link>
          <Link
            href="/app/calendar"
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-ink/20"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-sage">
              <CalendarDays className="size-4" />
            </span>
            <span className="text-sm font-medium">Plan the week</span>
            <ArrowRight className="ml-auto size-4 text-muted" />
          </Link>
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 ? (
        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl">Recently added</h2>
            <Link
              href="/app/wardrobe"
              className="text-sm text-muted hover:text-ink"
            >
              See all
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {recent.slice(0, 6).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Guest nudge */}
      {actor.isGuest ? (
        <section className="rounded-card border border-accent/20 bg-accent-soft px-5 py-5">
          <h2 className="font-display text-xl text-accent-hover">
            Keep this closet
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-accent-hover/80">
            Create an account and everything you added as a guest moves with
            you. No re-entering.
          </p>
          <Link
            href="/register"
            className={`${buttonVariants({ variant: "accent", size: "md" })} mt-4`}
          >
            Create a free account
          </Link>
        </section>
      ) : null}
    </div>
  );
}
