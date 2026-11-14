import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Archive, ArchiveRestore, Pencil, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteItemButton } from "@/components/wardrobe/delete-item-button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { toggleItemArchiveAction } from "@/lib/actions/items";
import { getItem, listItems } from "@/db/queries/items";
import { itemWearStats } from "@/db/queries/outfits";
import { requireActor } from "@/lib/actor";
import { categoryMeta, colorName, LAUNDRY_STATUSES } from "@/lib/categories";
import { rankByHarmony } from "@/lib/color";
import { formatShortDate } from "@/lib/outfits";
import { countsFromItems, versatilityFor } from "@/lib/versatility";
import { formatPrice } from "@/lib/utils";

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireActor();
  const { id } = await params;
  const query = await searchParams;

  const item = await getItem(actor.userId, id);
  if (!item) notFound();

  const all = await listItems(actor.userId);
  const counts = countsFromItems(all);
  const wear = await itemWearStats(actor.userId, item.id);
  const price = Number(item.purchasePrice ?? 0);
  const costPerWear =
    Number.isFinite(price) && price > 0 && wear.wears > 0
      ? price / wear.wears
      : null;
  const versatility = versatilityFor(
    { category: item.category as never },
    counts,
  );
  const matches = rankByHarmony(
    item.primaryColor,
    all.filter((entry) => entry.id !== item.id),
    3,
  );

  const meta = categoryMeta(item.category);
  const laundry = LAUNDRY_STATUSES.find(
    (status) => status.value === item.laundryStatus,
  );

  const detailRows: [string, string | null][] = [
    ["Category", meta.singular],
    ["Colour", colorName(item.primaryColor)],
    ["Brand", item.brand],
    ["Pattern", item.pattern],
    ["Subcategory", item.subcategory],
    ["Price", formatPrice(item.purchasePrice, item.currency)],
    ["Cost per wear", costPerWear ? formatPrice(costPerWear, item.currency) : null],
    ["Care status", laundry?.label ?? null],
    [
      "Seasons",
      item.seasons.length > 0 ? item.seasons.join(", ") : null,
    ],
    [
      "Occasions",
      item.occasions.length > 0 ? item.occasions.join(", ") : null,
    ],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/app/wardrobe"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Wardrobe
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/wardrobe/${item.id}`}
            className="hidden"
            aria-hidden
            tabIndex={-1}
          />
          <Link
            href={`/app/wardrobe/${item.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <form action={toggleItemArchiveAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {item.archivedAt ? (
                <ArchiveRestore className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
              {item.archivedAt ? "Restore" : "Archive"}
            </button>
          </form>
          <DeleteItemButton id={item.id} name={item.name} />
        </div>
      </div>

      {query.created === "1" || query.saved === "1" ? (
        <p className="rounded-2xl border border-sage/30 bg-sage-soft px-4 py-3 text-sm text-sage">
          {query.created === "1"
            ? "Added to your wardrobe."
            : "Changes saved."}
        </p>
      ) : null}

      {item.archivedAt ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          This piece is archived. It is hidden from suggestions, insights and
          outfit builders, but stays in outfits that already use it.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-start">
        <GarmentImage
          src={item.imageUrl}
          alt={item.name}
          ratio="aspect-[4/5]"
          priority
          className="border border-line"
        />

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="neutral">{meta.singular}</Badge>
              {item.favorite ? <Badge tone="accent">Favourite</Badge> : null}
              {item.archivedAt ? (
                <Badge tone="outline">Archived</Badge>
              ) : null}
              {item.laundryStatus !== "available" ? (
                <Badge tone="warning">{laundry?.label}</Badge>
              ) : null}
            </div>
            <h1 className="mt-3 font-display text-3xl leading-tight">
              {item.name}
            </h1>
            {item.primaryColor ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <span
                  aria-hidden
                  className="size-3.5 rounded-full border border-line"
                  style={{ backgroundColor: item.primaryColor }}
                />
                {colorName(item.primaryColor)}
              </p>
            ) : null}
          </div>

          {/* Versatility */}
          <section className="rounded-card border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="size-4 text-sage" />
                Versatility
              </h2>
              <span className="font-display text-2xl">{versatility.score}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-sage transition-all"
                style={{ width: `${versatility.score}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-medium">{versatility.label}</p>
            <p className="mt-1 text-sm text-muted">{versatility.detail}</p>
            <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-xs text-muted">
              <span>
                Worn {wear.wears} time{wear.wears === 1 ? "" : "s"}
              </span>
              <span>
                {wear.lastWorn
                  ? `Last ${formatShortDate(wear.lastWorn)}`
                  : "Never worn"}
              </span>
            </div>
          </section>

          {/* Details */}
          <section className="rounded-card border border-line bg-surface p-4 shadow-card">
            <h2 className="text-sm font-semibold">Details</h2>
            <dl className="mt-3 divide-y divide-line/70">
              {detailRows
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 py-2 text-sm"
                  >
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right capitalize">{value}</dd>
                  </div>
                ))}
            </dl>
            {item.notes ? (
              <p className="mt-3 rounded-xl bg-surface-2/70 px-3 py-2.5 text-sm text-ink-soft">
                {item.notes}
              </p>
            ) : null}
          </section>
        </div>
      </div>

      {/* Harmony */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-accent" />
              Pairs well with
            </h2>
            <p className="mt-1 text-sm text-muted">
              Ranked with colour theory from your own wardrobe.
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Add more pieces with a colour set to see pairings.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {matches.map(({ item: match, harmony }) => (
              <li key={match.id}>
                <Link
                  href={`/app/wardrobe/${match.id}`}
                  className="block overflow-hidden rounded-2xl border border-line transition-colors hover:border-ink/20"
                >
                  <GarmentImage
                    src={match.imageUrl}
                    alt={match.name}
                    ratio="aspect-[5/4]"
                    imgClassName="object-cover"
                  />
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-medium">{match.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted">{harmony.label}</span>
                      <span className="text-xs font-semibold text-accent">
                        {harmony.score}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {matches[0] ? (
          <p className="mt-3 text-xs text-muted">{matches[0].harmony.detail}</p>
        ) : null}
      </section>
    </div>
  );
}
