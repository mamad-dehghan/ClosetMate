"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { CATEGORIES, OCCASIONS, SEASONS, categoryMeta } from "@/lib/categories";
import { harmonyForColors } from "@/lib/color";
import { sortPiecesByCategory } from "@/lib/outfits";
import {
  saveOutfitAction,
  type OutfitActionState,
} from "@/lib/actions/outfits";
import { cn } from "@/lib/utils";

export type StudioItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  primaryColor: string | null;
};

export type StudioOutfit = {
  id?: string;
  name?: string | null;
  description?: string | null;
  occasion?: string | null;
  season?: string | null;
  favorite?: boolean;
  itemIds?: string[];
};

export function OutfitStudio({
  items,
  outfit,
}: {
  items: StudioItem[];
  outfit?: StudioOutfit;
}) {
  const [selected, setSelected] = useState<string[]>(outfit?.itemIds ?? []);
  const [state, action, pending] = useActionState<OutfitActionState, FormData>(
    saveOutfitAction,
    {},
  );

  const byId = new Map(items.map((item) => [item.id, item]));
  const selectedItems = selected
    .map((id) => byId.get(id))
    .filter((item): item is StudioItem => Boolean(item));
  const harmony = harmonyForColors(selectedItems.map((item) => item.primaryColor));

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }

  return (
    <form action={action} className="space-y-6">
      {outfit?.id ? <input type="hidden" name="id" value={outfit.id} /> : null}
      {selected.map((id) => (
        <input key={id} type="hidden" name="itemIds" value={id} />
      ))}

      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      {/* Selected pieces */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">On the rail</h2>
            <p className="mt-0.5 text-xs text-muted">
              {selectedItems.length === 0
                ? "Tap pieces below to build the outfit."
                : `${selectedItems.length} piece${selectedItems.length === 1 ? "" : "s"} selected`}
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
            Nothing selected yet.
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {sortPiecesByCategory(selectedItems).map((item) => (
                <div key={item.id} className="relative">
                  <GarmentImage
                    src={item.imageUrl}
                    alt={item.name}
                    ratio="aspect-[4/5]"
                    imgClassName="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="absolute right-1 top-1 z-10 flex size-6 items-center justify-center rounded-full bg-canvas/90 text-muted shadow-card backdrop-blur hover:text-ink"
                  >
                    <X className="size-3.5" />
                  </button>
                  <p className="mt-1 truncate text-[11px] text-muted">
                    {categoryMeta(item.category).singular}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-2/70 px-3 py-2">
              <Sparkles className="size-3.5 text-accent" />
              <span className="text-xs text-ink-soft">
                Colour harmony{" "}
                <span className="font-semibold">{harmony.score}</span> ·{" "}
                {harmony.label}
              </span>
            </div>
          </>
        )}
      </section>

      {/* Picker */}
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
                <span className="text-xs text-muted">
                  {categoryItems.length}
                </span>
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
                      <GarmentImage
                        src={item.imageUrl}
                        alt={item.name}
                        ratio="aspect-[4/5]"
                      />
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

      {/* Details */}
      <section className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card">
        <Field
          label="Outfit name"
          htmlFor="name"
          hint="Optional — we will name it after the occasion."
        >
          <Input
            id="name"
            name="name"
            defaultValue={outfit?.name ?? ""}
            placeholder="Monday at the studio"
            maxLength={80}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Occasion" htmlFor="occasion">
            <Select
              id="occasion"
              name="occasion"
              defaultValue={outfit?.occasion ?? ""}
            >
              <option value="">Not set</option>
              {OCCASIONS.map((occasion) => (
                <option key={occasion.value} value={occasion.value}>
                  {occasion.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Season" htmlFor="season">
            <Select id="season" name="season" defaultValue={outfit?.season ?? ""}>
              <option value="">All year</option>
              {SEASONS.map((season) => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notes" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            defaultValue={outfit?.description ?? ""}
            placeholder="What makes this combination work."
            maxLength={400}
          />
        </Field>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 text-sm">
          <input
            type="checkbox"
            name="favorite"
            defaultChecked={outfit?.favorite}
            className="size-4 accent-accent"
          />
          Mark as a favourite outfit
        </label>
      </section>

      <div className="sticky bottom-24 z-20 flex items-center gap-3 rounded-2xl border border-line bg-canvas/95 p-2.5 shadow-lift backdrop-blur md:bottom-4">
        <div className="min-w-0 flex-1 pl-2">
          <p className="truncate text-sm font-medium">
            {selectedItems.length} piece{selectedItems.length === 1 ? "" : "s"}
          </p>
          <p className="truncate text-xs text-muted">
            Harmony {harmony.score} · {harmony.label}
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
          {outfit?.id ? "Save outfit" : "Create outfit"}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-sm text-muted">
          Your wardrobe is empty.{" "}
          <Link href="/app/wardrobe/new" className="text-accent hover:underline">
            Add a piece
          </Link>{" "}
          first.
        </p>
      ) : null}
    </form>
  );
}
