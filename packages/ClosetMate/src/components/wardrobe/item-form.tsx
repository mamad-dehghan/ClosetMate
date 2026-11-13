"use client";

import { useActionState, useRef, useState } from "react";
import {
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  CATEGORIES,
  COLOR_SWATCHES,
  LAUNDRY_STATUSES,
  OCCASIONS,
  PATTERNS,
  SEASONS,
  colorName,
  defaultItemName,
} from "@/lib/categories";
import {
  createItemAction,
  updateItemAction,
  type ItemActionState,
} from "@/lib/actions/items";
import { prepareImage, uploadPreparedImage } from "@/lib/image-client";
import { cn } from "@/lib/utils";

export type ItemFormValues = {
  id?: string;
  name?: string;
  category?: string;
  subcategory?: string | null;
  imageUrl?: string | null;
  primaryColor?: string | null;
  seasons?: string[];
  occasions?: string[];
  pattern?: string | null;
  brand?: string | null;
  notes?: string | null;
  purchasePrice?: string | null;
  favorite?: boolean;
  laundryStatus?: string;
};

export function ItemForm({
  mode,
  item,
}: {
  mode: "create" | "edit";
  item?: ItemFormValues;
}) {
  const action = mode === "create" ? createItemAction : updateItemAction;
  const [state, formAction, pending] = useActionState<ItemActionState, FormData>(
    action,
    {},
  );

  const [category, setCategory] = useState(item?.category ?? "top");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [preview, setPreview] = useState<string | null>(item?.imageUrl ?? null);
  const [color, setColor] = useState(item?.primaryColor ?? "");
  const [touchedColor, setTouchedColor] = useState(Boolean(item?.primaryColor));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    try {
      const prepared = await prepareImage(file);
      setPreview(prepared.preview);
      const stored = await uploadPreparedImage(prepared.blob);
      setImageUrl(stored.url);
      if (prepared.color && !touchedColor) {
        setColor(prepared.color);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not upload the photo",
      );
    } finally {
      setUploading(false);
    }
  }

  const derivedName = defaultItemName(category, color);
  const error = state.error ?? uploadError;

  return (
    <form action={formAction} className="space-y-6">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="primaryColor" value={color} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {/* Photo */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Photo</h2>
            <p className="mt-0.5 text-xs text-muted">
              One photo is enough. We will shrink it and pick the main colour.
            </p>
          </div>
          <Camera className="size-4 text-muted" />
        </div>

        <div className="mt-4 flex gap-4">
          <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-2">
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Selected clothing"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted">
                <ImagePlus className="size-6" />
              </div>
            )}
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/45 text-canvas">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {preview ? "Replace photo" : "Choose or take a photo"}
            </Button>
            {preview ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  setImageUrl("");
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                <X className="size-3.5" />
                Remove
              </Button>
            ) : null}
            <p className="text-xs text-muted">
              Optional — you can add the photo later.
            </p>
          </div>
        </div>
      </section>

      {/* Category + name */}
      <section className="space-y-5 rounded-card border border-line bg-surface p-4 shadow-card">
        <div>
          <h2 className="text-sm font-semibold">Category</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {CATEGORIES.map((entry) => (
              <button
                key={entry.value}
                type="button"
                onClick={() => setCategory(entry.value)}
                className={cn(
                  "flex min-h-11 items-center justify-center rounded-xl border px-2 text-sm transition-colors",
                  category === entry.value
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-canvas text-muted hover:border-ink/25 hover:text-ink",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="Name"
          htmlFor="name"
          hint={`Leave empty and we will call it "${derivedName || "Top"}".`}
        >
          <Input
            id="name"
            name="name"
            defaultValue={item?.name ?? ""}
            placeholder={derivedName || "Ivory cotton tee"}
            maxLength={120}
          />
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">Main colour</span>
            {color ? (
              <span className="text-xs text-muted">
                {colorName(color)} · {color}
              </span>
            ) : (
              <span className="text-xs text-muted">Auto-picked from photo</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((swatch) => {
              const selected =
                color.toUpperCase() === swatch.hex.toUpperCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  title={swatch.name}
                  aria-label={swatch.name}
                  aria-pressed={selected}
                  onClick={() => {
                    setColor(swatch.hex);
                    setTouchedColor(true);
                  }}
                  className={cn(
                    "relative size-9 rounded-full border transition-transform",
                    selected
                      ? "scale-110 border-ink ring-2 ring-ink/20"
                      : "border-line hover:scale-105",
                  )}
                  style={{ backgroundColor: swatch.hex }}
                >
                  {selected ? (
                    <Check className="absolute inset-0 m-auto size-4 text-ink mix-blend-difference" />
                  ) : null}
                </button>
              );
            })}
            <label
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-dashed border-line text-muted hover:border-ink/30"
              title="Custom colour"
            >
              <Sparkles className="size-4" />
              <input
                type="color"
                className="sr-only"
                value={color || "#C4633F"}
                onChange={(event) => {
                  setColor(event.target.value.toUpperCase());
                  setTouchedColor(true);
                }}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="space-y-5 rounded-card border border-line bg-surface p-4 shadow-card">
        <div>
          <h2 className="text-sm font-semibold">When do you wear it?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <label key={season.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="seasons"
                  value={season.value}
                  defaultChecked={item?.seasons?.includes(season.value)}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-9 items-center rounded-pill border border-line bg-canvas px-3.5 text-sm text-muted transition-colors peer-checked:border-sage/40 peer-checked:bg-sage-soft peer-checked:text-sage peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                  {season.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Occasions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {OCCASIONS.map((occasion) => (
              <label key={occasion.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="occasions"
                  value={occasion.value}
                  defaultChecked={item?.occasions?.includes(occasion.value)}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-9 items-center rounded-pill border border-line bg-canvas px-3.5 text-sm text-muted transition-colors peer-checked:border-accent/40 peer-checked:bg-accent-soft peer-checked:text-accent-hover peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                  {occasion.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Optional details */}
      <details className="group rounded-card border border-line bg-surface p-4 shadow-card">
        <summary className="cursor-pointer text-sm font-semibold marker:content-none">
          More details
          <span className="ml-1.5 font-normal text-muted">(optional)</span>
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Brand" htmlFor="brand">
            <Input
              id="brand"
              name="brand"
              defaultValue={item?.brand ?? ""}
              placeholder="Everlane"
              maxLength={80}
            />
          </Field>
          <Field label="Pattern" htmlFor="pattern">
            <Select
              id="pattern"
              name="pattern"
              defaultValue={item?.pattern ?? ""}
            >
              <option value="">Not set</option>
              {PATTERNS.map((pattern) => (
                <option key={pattern} value={pattern}>
                  {pattern[0]?.toUpperCase()}
                  {pattern.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Subcategory" htmlFor="subcategory">
            <Input
              id="subcategory"
              name="subcategory"
              defaultValue={item?.subcategory ?? ""}
              placeholder="T-shirt, blouse, knit…"
              maxLength={60}
            />
          </Field>
          <Field label="Purchase price" htmlFor="purchasePrice" hint="Used for cost-per-wear later.">
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={item?.purchasePrice ?? ""}
              placeholder="45.00"
            />
          </Field>
          <Field label="Care status" htmlFor="laundryStatus">
            <Select
              id="laundryStatus"
              name="laundryStatus"
              defaultValue={item?.laundryStatus ?? "available"}
            >
              {LAUNDRY_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <label className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 text-sm">
              <input
                type="checkbox"
                name="favorite"
                defaultChecked={item?.favorite}
                className="size-4 accent-accent"
              />
              Mark as a favourite
            </label>
          </div>
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea
              id="notes"
              name="notes"
              defaultValue={item?.notes ?? ""}
              placeholder="Fits well with the camel coat. Needs a repair at the hem."
              maxLength={600}
            />
          </Field>
        </div>
      </details>

      <div className="sticky bottom-24 z-20 rounded-2xl border border-line bg-canvas/95 p-2.5 shadow-lift backdrop-blur md:bottom-4">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending || uploading}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {mode === "create" ? "Add to wardrobe" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
