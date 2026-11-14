import type { Item } from "@/db/schema";
import { CATEGORIES, type Category } from "./categories";

export type PackingBand = "cold" | "mild" | "warm";

export type PackingInput = {
  days: number;
  band: PackingBand;
  occasion: string;
};

export type PackingPlan = {
  groups: { category: Category; label: string; items: Item[] }[];
  outfits: number;
  total: number;
  notes: string[];
};

const BAND_SEASONS: Record<PackingBand, string[]> = {
  cold: ["winter", "autumn"],
  mild: ["spring", "autumn"],
  warm: ["summer"],
};

const BAND_NOTES: Record<PackingBand, string> = {
  cold: "Pack a warm outer layer and closed shoes.",
  mild: "Layers are the safest bet for a mild forecast.",
  warm: "Choose breathable fabrics; one light layer is enough.",
};

function eligible(item: Item, input: PackingInput) {
  if (item.laundryStatus !== "available") return false;

  const seasons = BAND_SEASONS[input.band];
  if (item.seasons.length > 0 && !item.seasons.some((season) => seasons.includes(season))) {
    return false;
  }

  if (
    item.occasions.length > 0 &&
    !item.occasions.includes(input.occasion)
  ) {
    return false;
  }

  return true;
}

function byCategory(items: Item[], category: Category) {
  return items
    .filter((item) => item.category === category)
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Turns a trip length and forecast band into a minimal packing list from what
 * the user already owns. Deliberately conservative: it would rather leave
 * something behind than suggest buying anything.
 */
export function buildPackingPlan(items: Item[], input: PackingInput): PackingPlan {
  const days = Math.max(1, Math.min(21, Math.round(input.days)));
  const pool = items.filter((item) => eligible(item, input));

  const tops = byCategory(pool, "top");
  const bottoms = byCategory(pool, "bottom");
  const dresses = byCategory(pool, "dress");
  const shoes = byCategory(pool, "shoes");
  const outerwear = byCategory(pool, "outerwear");
  const accessories = byCategory(pool, "accessory");

  const picks: [Category, number][] = [
    ["top", Math.min(tops.length, Math.max(2, Math.min(days, 6)))],
    ["bottom", Math.min(bottoms.length, Math.max(1, Math.ceil(days / 2)))],
    ["dress", input.band === "cold" ? 0 : Math.min(dresses.length, 1)],
    ["shoes", Math.min(shoes.length, days >= 4 ? 3 : 2)],
    ["outerwear", input.band === "cold" ? Math.min(outerwear.length, 1) : 0],
    ["accessory", Math.min(accessories.length, 1)],
  ];

  const groups = picks
    .map(([category, count]) => {
      const source =
        category === "top"
          ? tops
          : category === "bottom"
            ? bottoms
            : category === "dress"
              ? dresses
              : category === "shoes"
                ? shoes
                : category === "outerwear"
                  ? outerwear
                  : accessories;

      const chosen = source.slice(0, count);
      const label = CATEGORIES.find((entry) => entry.value === category)?.label ?? category;
      return { category, label, items: chosen };
    })
    .filter((group) => group.items.length > 0);

  const chosenTops = groups.find((group) => group.category === "top")?.items.length ?? 0;
  const chosenBottoms = groups.find((group) => group.category === "bottom")?.items.length ?? 0;
  const chosenDresses = groups.find((group) => group.category === "dress")?.items.length ?? 0;
  const hasShoes = (groups.find((group) => group.category === "shoes")?.items.length ?? 0) > 0;

  const outfits = hasShoes ? chosenTops * chosenBottoms + chosenDresses : 0;

  const notes = [BAND_NOTES[input.band]];
  if (days >= 7) notes.push("Plan one laundry stop and you can halve the bag.");
  if (input.occasion === "work") notes.push("Two bottoms cover a work week.");
  if (outfits > 0 && outfits < days) {
    notes.push(`This list covers about ${outfits} outfit${outfits === 1 ? "" : "s"} — add a base layer or plan to repeat.`);
  }
  if (groups.length === 0) {
    notes.push("Nothing in your wardrobe matches this trip yet.");
  }

  return {
    groups,
    outfits,
    total: groups.reduce((sum, group) => sum + group.items.length, 0),
    notes,
  };
}
