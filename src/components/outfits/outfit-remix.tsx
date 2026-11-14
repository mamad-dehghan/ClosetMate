"use client";

import { useActionState, useState } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import {
  saveOutfitAction,
  type OutfitActionState,
} from "@/lib/actions/outfits";
import { categoryMeta } from "@/lib/categories";
import { remixHarmony } from "@/lib/remix";
import { cn } from "@/lib/utils";

export type RemixPiece = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  primaryColor: string | null;
};

export type RemixSlotData = {
  base: RemixPiece;
  alternatives: { item: RemixPiece; score: number; label: string }[];
};

export function OutfitRemix({
  outfit,
  slots,
}: {
  outfit: { id: string; name: string; occasion: string | null; season: string | null };
  slots: RemixSlotData[];
}) {
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(slots.map((slot) => [slot.base.id, slot.base.id])),
  );

  const [state, action, pending] = useActionState<OutfitActionState, FormData>(
    saveOutfitAction,
    {},
  );

  const byId = new Map<string, RemixPiece>();
  for (const slot of slots) {
    byId.set(slot.base.id, slot.base);
    for (const alternative of slot.alternatives) {
      byId.set(alternative.item.id, alternative.item);
    }
  }

  const chosen = slots
    .map((slot) => byId.get(selection[slot.base.id] ?? slot.base.id))
    .filter((piece): piece is RemixPiece => Boolean(piece));

  const harmony = remixHarmony(chosen);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="name" value={`${outfit.name} remix`} />
      {outfit.occasion ? (
        <input type="hidden" name="occasion" value={outfit.occasion} />
      ) : null}
      {outfit.season ? (
        <input type="hidden" name="season" value={outfit.season} />
      ) : null}
      {chosen.map((piece) => (
        <input key={piece.id} type="hidden" name="itemIds" value={piece.id} />
      ))}

      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Your remix</h2>
          <span className="text-xs text-muted">Harmony {harmony}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {chosen.map((piece) => (
            <div key={piece.id}>
              <GarmentImage
                src={piece.imageUrl}
                alt={piece.name}
                ratio="aspect-[4/5]"
              />
              <p className="mt-1 truncate text-[11px] text-muted">
                {categoryMeta(piece.category).singular}
              </p>
            </div>
          ))}
        </div>
      </section>

      {slots.map((slot) => {
        const selectedId = selection[slot.base.id] ?? slot.base.id;

        return (
          <section key={slot.base.id}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">
                Swap the {categoryMeta(slot.base.category).singular.toLowerCase()}
              </h2>
              <span className="text-xs text-muted">
                {slot.alternatives.length} alternative
                {slot.alternatives.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
              {[
                { item: slot.base, score: null as number | null, label: "Current" },
                ...slot.alternatives.map((alternative) => ({
                  item: alternative.item,
                  score: alternative.score,
                  label: alternative.label,
                })),
              ].map((option) => {
                const active = selectedId === option.item.id;
                return (
                  <button
                    key={option.item.id}
                    type="button"
                    onClick={() =>
                      setSelection((current) => ({
                        ...current,
                        [slot.base.id]: option.item.id,
                      }))
                    }
                    aria-pressed={active}
                    className={cn(
                      "relative w-24 shrink-0 rounded-2xl border p-1.5 text-left transition-colors",
                      active
                        ? "border-ink bg-ink/[0.03]"
                        : "border-line bg-surface hover:border-ink/20",
                    )}
                  >
                    <GarmentImage
                      src={option.item.imageUrl}
                      alt={option.item.name}
                      ratio="aspect-[4/5]"
                    />
                    {active ? (
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-ink text-canvas">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                    <p className="mt-1 truncate px-0.5 text-[11px] text-muted">
                      {option.item.name}
                    </p>
                    {option.score !== null ? (
                      <p className="px-0.5 text-[10px] text-muted/80">
                        {option.score} · {option.label}
                      </p>
                    ) : null}
                  </button>
                );
              })}

              {slot.alternatives.length === 0 ? (
                <p className="py-6 text-sm text-muted">
                  No other {categoryMeta(slot.base.category).plural} to try yet.
                </p>
              ) : null}
            </div>
          </section>
        );
      })}

      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <label className="text-sm font-medium" htmlFor="name-display">
          Save as
        </label>
        <Input
          id="name-display"
          defaultValue={`${outfit.name} remix`}
          readOnly
          className="mt-2 bg-surface-2/60"
        />
        <p className="mt-1.5 text-xs text-muted">
          The original outfit is left untouched.
        </p>
      </section>

      <div className="sticky bottom-24 z-20 flex items-center gap-3 rounded-2xl border border-line bg-canvas/95 p-2.5 shadow-lift backdrop-blur md:bottom-4">
        <button
          type="button"
          onClick={() =>
            setSelection(
              Object.fromEntries(
                slots.map((slot) => [slot.base.id, slot.base.id]),
              ),
            )
          }
          className="inline-flex items-center gap-1.5 px-2 text-sm text-muted hover:text-ink"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
        <Button type="submit" size="md" className="ml-auto" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Save as new outfit
        </Button>
      </div>
    </form>
  );
}
