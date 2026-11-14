"use client";

import { useActionState, useState } from "react";
import { Check, Loader2, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { CATEGORIES, OCCASIONS, SEASONS } from "@/lib/categories";
import { capsuleSummary } from "@/lib/capsules";
import { sortPiecesByCategory } from "@/lib/outfits";
import {
  saveCapsuleAction,
  type CapsuleActionState,
} from "@/lib/actions/capsules";
import { cn } from "@/lib/utils";

export type CapsuleItemLite = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
};

export type CapsuleDefaults = {
  id?: string;
  name?: string | null;
  description?: string | null;
  season?: string | null;
  occasion?: string | null;
  itemIds?: string[];
};

export function CapsuleEditor({
  items,
  wardrobeTotal,
  capsule,
}: {
  items: CapsuleItemLite[];
  wardrobeTotal: number;
  capsule?: CapsuleDefaults;
}) {
  const [selected, setSelected] = useState<string[]>(capsule?.itemIds ?? []);
  const [state, action, pending] = useActionState<CapsuleActionState, FormData>(
    saveCapsuleAction,
    {},
  );

  const byId = new Map(items.map((item) => [item.id, item]));
  const selectedItems = selected
    .map((id) => byId.get(id))
    .filter((item): item is CapsuleItemLite => Boolean(item));
  const summary = capsuleSummary(selectedItems, wardrobeTotal);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }

  return (
    <form action={action} className="space-y-6">
      {capsule?.id ? <input type="hidden" name="id" value={capsule.id} /> : null}
      {selected.map((id) => (
        <input key={id} type="hidden" name="itemIds" value={id} />
      ))}

      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Package className="size-4 text-sage" />
              Capsule
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {selectedItems.length} piece
              {selectedItems.length === 1 ? "" : "s"} · {summary.coverage}% of
              your wardrobe
            </p>
          </div>
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>

        {selectedItems.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            Pick the pieces this capsule should contain.
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {sortPiecesByCategory(selectedItems).map((item) => (
                <div key={item.id} className="relative">
                  <GarmentImage src={item.imageUrl} alt={item.name} />
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-canvas/90 text-muted shadow-card backdrop-blur hover:text-ink"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
              <p className="rounded-xl bg-surface-2/70 px-3 py-2">
                <span className="font-semibold text-ink">{summary.capacity}</span>{" "}
                complete outfits
              </p>
              <p className="rounded-xl bg-surface-2/70 px-3 py-2">
                {summary.missing.length === 0
                  ? "Covers every base category"
                  : `Missing ${summary.missing.join(", ")}`}
              </p>
            </div>
          </>
        )}
      </section>

      <section className="space-y-5">
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter(
            (item) => item.category === category.value,
          );
          if (categoryItems.length === 0) return null;

          return (
            <div key={category.value}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">{category.label}</h2>
                <span className="text-xs text-muted">{categoryItems.length}</span>
              </div>
              <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
                {categoryItems.map((item) => {
                  const active = selected.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-pressed={active}
                      className={cn(
                        "relative w-24 shrink-0 rounded-2xl border p-1.5 text-left transition-colors",
                        active
                          ? "border-ink bg-ink/[0.03]"
                          : "border-line bg-surface hover:border-ink/20",
                      )}
                    >
                      <GarmentImage src={item.imageUrl} alt={item.name} />
                      {active ? (
                        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-ink text-canvas">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                      <p className="mt-1 truncate px-0.5 text-[11px] text-muted">
                        {item.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card">
        <Field label="Capsule name" htmlFor="name">
          <Input
            id="name"
            name="name"
            defaultValue={capsule?.name ?? ""}
            placeholder="Autumn ten"
            maxLength={80}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Season" htmlFor="season">
            <Select id="season" name="season" defaultValue={capsule?.season ?? ""}>
              <option value="">All year</option>
              {SEASONS.map((season) => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Occasion" htmlFor="occasion">
            <Select
              id="occasion"
              name="occasion"
              defaultValue={capsule?.occasion ?? ""}
            >
              <option value="">Not set</option>
              {OCCASIONS.map((occasion) => (
                <option key={occasion.value} value={occasion.value}>
                  {occasion.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notes" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            defaultValue={capsule?.description ?? ""}
            placeholder="What this capsule is for."
            maxLength={400}
          />
        </Field>
      </section>

      <div className="sticky bottom-24 z-20 flex items-center gap-3 rounded-2xl border border-line bg-canvas/95 p-2.5 shadow-lift backdrop-blur md:bottom-4">
        <div className="min-w-0 flex-1 pl-2">
          <p className="truncate text-sm font-medium">
            {selectedItems.length} piece{selectedItems.length === 1 ? "" : "s"}
          </p>
          <p className="truncate text-xs text-muted">
            {summary.coverage}% coverage · {summary.capacity} outfits
          </p>
        </div>
        <Button
          type="submit"
          size="md"
          disabled={pending || selectedItems.length === 0}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {capsule?.id ? "Save capsule" : "Create capsule"}
        </Button>
      </div>
    </form>
  );
}
