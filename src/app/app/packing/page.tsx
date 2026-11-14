import Link from "next/link";
import { ArrowLeft, Luggage, Plane, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { listItems } from "@/db/queries/items";
import { requireActor } from "@/lib/actor";
import { savePackingCapsuleAction } from "@/lib/actions/capsules";
import { OCCASIONS } from "@/lib/categories";
import { buildPackingPlan, type PackingBand } from "@/lib/packing";

export const metadata = { title: "Packing assistant" };

const BANDS: { value: PackingBand; label: string }[] = [
  { value: "cold", label: "Cold (under 10°C)" },
  { value: "mild", label: "Mild (10–22°C)" },
  { value: "warm", label: "Warm (over 22°C)" },
];

export default async function PackingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireActor();
  const raw = await searchParams;

  const daysRaw = Number(
    typeof raw.days === "string" ? raw.days : "4",
  );
  const days = Number.isFinite(daysRaw)
    ? Math.max(1, Math.min(21, Math.round(daysRaw)))
    : 4;

  const bandInput = typeof raw.band === "string" ? raw.band : "mild";
  const band: PackingBand = ["cold", "mild", "warm"].includes(bandInput)
    ? (bandInput as PackingBand)
    : "mild";

  const occasionInput =
    typeof raw.occasion === "string" ? raw.occasion : "casual";
  const occasion = OCCASIONS.some((entry) => entry.value === occasionInput)
    ? occasionInput
    : "casual";

  const items = await listItems(actor.userId);
  const plan = buildPackingPlan(items, { days, band, occasion });
  const allIds = plan.groups.flatMap((group) => group.items.map((item) => item.id));

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
        <h1 className="mt-3 flex items-center gap-2 font-display text-3xl sm:text-4xl">
          <Luggage className="size-6 text-sage" />
          Packing assistant
        </h1>
        <p className="mt-1 text-sm text-muted">
          A minimal list for the trip, built only from clothes you own.
        </p>
      </div>

      <form
        method="get"
        action="/app/packing"
        className="grid gap-3 rounded-card border border-line bg-surface p-4 shadow-card sm:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Days away</span>
          <input
            type="number"
            name="days"
            min={1}
            max={21}
            defaultValue={days}
            className="h-11 w-full rounded-xl border border-line bg-canvas px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Forecast</span>
          <select
            name="band"
            defaultValue={band}
            className="h-11 w-full rounded-xl border border-line bg-canvas px-3"
          >
            {BANDS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Occasion</span>
          <select
            name="occasion"
            defaultValue={occasion}
            className="h-11 w-full rounded-xl border border-line bg-canvas px-3"
          >
            {OCCASIONS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className={`${buttonVariants({ size: "md" })} sm:self-end`}
        >
          <Plane className="size-4" />
          Plan
        </button>
      </form>

      {items.length === 0 ? (
        <section className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
          <h2 className="font-display text-2xl">Add clothes first</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            The packing list is built from your wardrobe, not from a shop.
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
          <section className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "Pieces", value: plan.total },
              { label: "Outfits", value: plan.outfits },
              { label: "Days", value: days },
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

          {plan.groups.length === 0 ? (
            <section className="rounded-card border border-dashed border-line bg-surface/60 px-5 py-10 text-center">
              <h2 className="font-display text-xl">Nothing matches this trip</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Try another forecast or occasion, or tag more pieces with the
                right season.
              </p>
            </section>
          ) : (
            <div className="space-y-4">
              {plan.groups.map((group) => (
                <section key={group.category}>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-sm font-semibold">{group.label}</h2>
                    <Badge tone="outline">{group.items.length}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {group.items.map((item) => (
                      <div key={item.id}>
                        <GarmentImage src={item.imageUrl} alt={item.name} />
                        <p className="mt-1 truncate text-[11px] text-muted">
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <section className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="text-sm font-semibold">Notes</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {plan.notes.map((note) => (
                <li key={note}>· {note}</li>
              ))}
            </ul>

            {allIds.length > 0 ? (
              <form action={savePackingCapsuleAction} className="mt-4">
                <input
                  type="hidden"
                  name="name"
                  value={`Packing · ${days} days · ${band}`}
                />
                {allIds.map((id) => (
                  <input key={id} type="hidden" name="itemIds" value={id} />
                ))}
                <button
                  type="submit"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Save className="size-4" />
                  Save as a capsule
                </button>
              </form>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
