import type { Category } from "./categories";

export type CategoryCounts = Record<Category, number>;

export type Versatility = {
  combinations: number;
  score: number;
  label: string;
  detail: string;
};

/** How many complete outfits the current wardrobe can produce. */
export function outfitCapacity(counts: CategoryCounts) {
  const tops = counts.top ?? 0;
  const bottoms = counts.bottom ?? 0;
  const dresses = counts.dress ?? 0;
  const shoes = counts.shoes ?? 0;
  const bases = tops * bottoms + dresses;
  return bases * Math.max(shoes, 1);
}

function scoreFromCombinations(combinations: number) {
  // log scale: 0 pieces → 0, 64+ complete outfits → 100
  const score = (Math.log2(combinations + 1) / Math.log2(65)) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function labelForScore(score: number) {
  if (score >= 72) return { label: "Wardrobe hero", detail: "This piece unlocks a lot of outfits." };
  if (score >= 45) return { label: "Versatile", detail: "Earns its place — many ways to wear it." };
  if (score >= 22) return { label: "Occasional", detail: "Works in a few combinations so far." };
  return { label: "Rarely used", detail: "Few partners right now. Add basics to unlock it." };
}

/**
 * Counts the complete outfits this single item can take part in, using
 * category rules only. A top needs a bottom and shoes; a dress needs shoes;
 * outerwear and accessories layer over any base.
 */
export function versatilityFor(
  item: { category: Category },
  counts: CategoryCounts,
): Versatility {
  const tops = counts.top ?? 0;
  const bottoms = counts.bottom ?? 0;
  const dresses = counts.dress ?? 0;
  const shoes = counts.shoes ?? 0;
  const outerwear = counts.outerwear ?? 0;
  const accessories = counts.accessory ?? 0;

  const bases = tops * bottoms + dresses;
  const shoesForBase = Math.max(shoes, 1);
  const layers = Math.max(1, 1 + outerwear * 0.5);
  const extras = Math.max(1, 1 + accessories * 0.5);

  let combinations = 0;
  switch (item.category) {
    case "top":
      combinations = bottoms * shoesForBase;
      break;
    case "bottom":
      combinations = tops * shoesForBase;
      break;
    case "dress":
      combinations = shoesForBase;
      break;
    case "shoes":
      combinations = bases;
      break;
    case "outerwear":
      combinations = bases * shoesForBase;
      break;
    case "accessory":
      combinations = bases * shoesForBase;
      break;
    default:
      combinations = 0;
  }

  if (item.category === "top" || item.category === "bottom" || item.category === "dress") {
    combinations = combinations * layers * extras;
  }

  combinations = Math.max(0, Math.round(combinations));
  const score = scoreFromCombinations(combinations);
  const meta = labelForScore(score);

  return {
    combinations,
    score,
    label: meta.label,
    detail:
      combinations === 0
        ? "No complete outfit yet — add the missing pieces."
        : `${meta.detail} ${combinations} combination${combinations === 1 ? "" : "s"} available.`,
  };
}

export function countsFromItems(
  items: { category: string }[],
): CategoryCounts {
  const counts: CategoryCounts = {
    top: 0,
    bottom: 0,
    dress: 0,
    outerwear: 0,
    shoes: 0,
    accessory: 0,
  };
  for (const item of items) {
    const key = item.category as Category;
    if (key in counts) counts[key] += 1;
  }
  return counts;
}
