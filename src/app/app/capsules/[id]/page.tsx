import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteCapsuleButton } from "@/components/capsules/delete-capsule-button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { countItems } from "@/db/queries/items";
import { getCapsule } from "@/db/queries/capsules";
import { requireActor } from "@/lib/actor";
import { capsuleSummary } from "@/lib/capsules";
import { OCCASIONS, SEASONS, categoryMeta } from "@/lib/categories";

export default async function CapsuleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireActor();
  const { id } = await params;
  const query = await searchParams;

  const [capsule, { total }] = await Promise.all([
    getCapsule(actor.userId, id),
    countItems(actor.userId),
  ]);

  if (!capsule) notFound();

  const summary = capsuleSummary(capsule.pieces, total);
  const season = SEASONS.find((entry) => entry.value === capsule.season);
  const occasion = OCCASIONS.find((entry) => entry.value === capsule.occasion);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/app/capsules"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Capsules
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/app/capsules/${capsule.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Edit
          </Link>
          <DeleteCapsuleButton id={capsule.id} name={capsule.name} />
        </div>
      </div>

      {query.saved === "1" ? (
        <p className="rounded-2xl border border-sage/30 bg-sage-soft px-4 py-3 text-sm text-sage">
          Capsule saved.
        </p>
      ) : null}

      <header>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="neutral">
            {summary.total} piece{summary.total === 1 ? "" : "s"}
          </Badge>
          {season ? <Badge tone="accent">{season.label}</Badge> : null}
          {occasion ? <Badge tone="outline">{occasion.label}</Badge> : null}
        </div>
        <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
          {capsule.name}
        </h1>
        {capsule.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {capsule.description}
          </p>
        ) : null}
      </header>

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Coverage", value: `${summary.coverage}%` },
          { label: "Outfits", value: summary.capacity },
          {
            label: "Missing",
            value: summary.missing.length === 0 ? "None" : summary.missing.length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-card border border-line bg-surface px-4 py-4 shadow-card"
          >
            <p className="font-display text-2xl">{stat.value}</p>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {summary.missing.length > 0 ? (
        <p className="rounded-2xl border border-amber-200/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add {summary.missing.join(", ")} to make this capsule wearable on its
          own.
        </p>
      ) : null}

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        {capsule.pieces.map((piece) => (
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

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Package className="size-4 text-sage" />
          Capsule math
        </h2>
        <p className="mt-1 text-sm text-muted">
          {summary.counts.top} tops × {summary.counts.bottom} bottoms
          {summary.counts.dress > 0 ? ` + ${summary.counts.dress} dresses` : ""}{" "}
          × {summary.counts.shoes} shoes = {summary.capacity} complete outfits.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/app/capsules"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            All capsules
          </Link>
          <Link
            href={`/app/capsules/${capsule.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Change pieces
          </Link>
        </div>
      </section>
    </div>
  );
}
