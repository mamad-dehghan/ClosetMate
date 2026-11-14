import { z } from "zod";
import {
  CATEGORY_VALUES,
  OCCASION_VALUES,
  OCCASIONS,
  SEASON_VALUES,
  SEASONS,
} from "./categories";

const hex = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex colour like #C4633F");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === "" ? undefined : value));

export const itemInputSchema = z.object({
  name: z.string().trim().max(120).default(""),
  category: z.enum(CATEGORY_VALUES),
  subcategory: optionalText(60),
  imageUrl: z.string().trim().max(600).optional().or(z.literal("").transform(() => undefined)),
  primaryColor: hex.optional().or(z.literal("").transform(() => undefined)),
  secondaryColors: z.array(hex).max(4).optional().default([]),
  seasons: z
    .array(z.enum(SEASONS.map((s) => s.value) as [string, ...string[]]))
    .optional()
    .default([]),
  occasions: z
    .array(z.enum(OCCASIONS.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .default([]),
  pattern: optionalText(40),
  brand: optionalText(80),
  notes: optionalText(600),
  purchasePrice: z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === "") return undefined;
      const parsed = typeof value === "string" ? Number(value) : value;
      return Number.isFinite(parsed) && parsed >= 0 ? parsed.toFixed(2) : undefined;
    }),
  favorite: z.boolean().optional().default(false),
  laundryStatus: z
    .enum(["available", "laundry", "repair"])
    .optional()
    .default("available"),
});

export type ItemInput = z.infer<typeof itemInputSchema>;

const isoDateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

export const outfitInputSchema = z.object({
  name: z.string().trim().max(80).default(""),
  description: optionalText(400),
  occasion: z
    .enum(OCCASION_VALUES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  season: z
    .enum(SEASON_VALUES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  favorite: z.boolean().optional().default(false),
  itemIds: z
    .array(z.string().trim().min(1))
    .min(1, "Pick at least one piece")
    .max(12, "An outfit of twelve pieces is plenty"),
});

export type OutfitInput = z.infer<typeof outfitInputSchema>;

export const outfitPlanSchema = z.object({
  outfitId: z.string().trim().min(1),
  plannedFor: isoDateString,
  note: optionalText(200),
});

export const outfitWearSchema = z.object({
  outfitId: z.string().trim().min(1),
  wornOn: isoDateString,
  note: optionalText(200),
});

export const itemFiltersSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  season: z.string().trim().optional(),
  occasion: z.string().trim().optional(),
  color: z.string().trim().optional(),
  favorite: z.enum(["1", "0"]).optional(),
  worn: z.enum(["stale"]).optional(),
  sort: z.enum(["recent", "name", "color"]).optional(),
});

export type ItemFilters = z.infer<typeof itemFiltersSchema>;
