import Link from "next/link";
import {
  ArrowLeft,
  CircleDollarSign,
  EyeOff,
  PackageOpen,
  Shirt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { countItems, listItems } from "@/db/queries/items";
import { lastWornByItem } from "@/db/queries/outfits";
import { requireActor } from "@/lib/actor";
import { categoryMeta } from "@/lib/categories";
import { analyzeWardrobe } from "@/lib/insights";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Wardrobe insights" };

export default async function InsightsPage() {
  const actor = await requireActor();

  const [items, { counts, total }, wear] = await Promise.all([
    listItems(actor.userId),
    countItems(actor.userId),
    lastWornByItem(actor.userId),
  ]);

  const analysis = analyzeWardrobe({
    counts,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      primaryColor: item.primaryColor,
      purchasePrice: item.purchasePrice,
      currency: item.currency,
    })),
    wear,
  });

  const byId = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/app/today"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Today
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          Wardrobe insights
        </h1>
        <p className="mt-1 text-sm text-muted">
          What your wardrobe can do, what blocks it, and what it costs per wear.
        </p>
      </div>

      {total === 0 ? (
        <section className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <Shirt className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl">Nothing to analyse yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Add a few pieces and this page will show coverage, gaps and cost per
            wear.
          </p>
          <Link
            href="/app/wardrobe/new"
            className={`${buttonVariants({ size: "md" })} mt-5`}
          >
            Add clothing
          </Link>
        </section>
      ) : (
        <>
          {/* Coverage */}
          <section className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="text-sm font-semibold">Coverage</h2>
            <p className="mt-1 text-sm text-muted">
              {analysis.total} pieces across your wardrobe.
            </p>
            <div className="mt-4 space-y-2.5">
              {analysis.coverage.map((entry) => {
                const max = Math.max(
                  ...analysis.coverage.map((row) => row.count),
                  1,
                );
                return (
                  <div key={entry.category}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{entry.label}</span>
                      <span className="text-muted">{entry.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-sage"
                        style={{ width: `${Math.round((entry.count / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Gaps */}
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              <PackageOpen className="size-4" />
              Gaps that block outfits
            </h2>
            {analysis.gaps.length === 0 ? (
              <p className="mt-3 rounded-card border border-line bg-sage-soft/60 px-4 py-4 text-sm text-sage">
                Nothing blocking. Every base category is covered — keep wearing
                what you have.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {analysis.gaps.map((gap) => (
                  <li
                    key={gap.key}
                    className="flex items-start gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Shirt className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{gap.title}</p>
                      <p className="mt-0.5 text-sm text-muted">{gap.detail}</p>
                    </div>
                    {gap.unlocks > 0 ? (
                      <Badge tone="accent" className="ml-auto shrink-0">
                        +{gap.unlocks} outfits
                      </Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Cost per wear */}
          <section className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CircleDollarSign className="size-4 text-sage" />
              Best cost per wear
            </h2>
            <p className="mt-1 text-sm text-muted">
              Purchase price divided by recorded wears. Prices are optional, so
              this only covers what you filled in.
            </p>
            {analysis.costLeaders.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-5 text-center text-sm text-muted">
                Add a purchase price to a few items and wear an outfit to see
                this.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line/70">
                {analysis.costLeaders.map((entry) => (
                  <li key={entry.item.id}>
                    <Link
                      href={`/app/wardrobe/${entry.item.id}`}
                      className="flex items-center gap-3 py-3"
                    >
                      <GarmentImage
                        src={byId.get(entry.item.id)?.imageUrl ?? null}
                        alt={entry.item.name}
                        ratio="aspect-square"
                        className="w-11 shrink-0 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {entry.item.name}
                        </p>
                        <p className="text-xs text-muted">
                          {entry.wears} wear{entry.wears === 1 ? "" : "s"} ·{" "}
                          {formatPrice(
                            entry.item.purchasePrice,
                            entry.item.currency,
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-sage">
                        {formatPrice(entry.costPerWear, entry.item.currency)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Never worn */}
          <section className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <EyeOff className="size-4 text-muted" />
              Never worn
            </h2>
            <p className="mt-1 text-sm text-muted">
              {analysis.neverWorn.length === 0
                ? "Every piece has appeared in a worn outfit. Well used."
                : `${analysis.neverWorn.length} piece${analysis.neverWorn.length === 1 ? "" : "s"} has not been in a worn outfit yet.`}
            </p>
            {analysis.neverWorn.length > 0 ? (
              <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar">
                {analysis.neverWorn.slice(0, 10).map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/app/wardrobe/${entry.id}`}
                    className="w-20 shrink-0"
                  >
                    <GarmentImage
                      src={byId.get(entry.id)?.imageUrl ?? null}
                      alt={entry.name}
                      ratio="aspect-[4/5]"
                    />
                    <p className="mt-1 truncate text-[11px] text-muted">
                      {categoryMeta(entry.category).singular}
                    </p>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
