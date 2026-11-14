import { CATEGORIES, type Category } from "./categories";

export type WearLite = { wears: number; lastWorn: string | null };

export type InsightItem = {
  id: string;
  name: string;
  category: string;
  primaryColor: string | null;
  purchasePrice: string | null;
  currency: string;
};

export type CategoryCounts = Record<Category, number>;

export type WardrobeGap = {
  key: string;
  category: Category;
  title: string;
  detail: string;
  unlocks: number;
};

export type CostLeader = {
  item: InsightItem;
  costPerWear: number;
  wears: number;
};

export type WardrobeAnalysis = {
  total: number;
  coverage: { category: Category; label: string; count: number }[];
  gaps: WardrobeGap[];
  neverWorn: InsightItem[];
  costLeaders: CostLeader[];
  averageCostPerWear: number | null;
};

const EMPTY_COUNTS: CategoryCounts = {
  top: 0,
  bottom: 0,
  dress: 0,
  outerwear: 0,
  shoes: 0,
  accessory: 0,
};

/**
 * Everything the insights page needs, derived from data we already store.
 * Pure so the rules are testable and explainable.
 */
export function analyzeWardrobe({
  counts,
  items,
  wear,
}: {
  counts: CategoryCounts;
  items: InsightItem[];
  wear: Map<string, WearLite>;
}): WardrobeAnalysis {
  const safe: CategoryCounts = { ...EMPTY_COUNTS, ...counts };
  const { top, bottom, dress, shoes } = safe;

  const gaps: WardrobeGap[] = [];

  if (shoes === 0) {
    gaps.push({
      key: "shoes",
      category: "shoes",
      title: "Add shoes",
      detail: "No combination is complete without a pair.",
      unlocks: top * bottom + dress,
    });
  }

  if (top === 0 && dress === 0) {
    gaps.push({
      key: "tops",
      category: "top",
      title: "Add a top or a dress",
      detail: "There is nothing to pair with your bottoms yet.",
      unlocks: bottom * Math.max(shoes, 1),
    });
  }

  if (bottom === 0 && dress === 0) {
    gaps.push({
      key: "bottoms",
      category: "bottom",
      title: "Add a bottom or a dress",
      detail: "Tops need something to land on.",
      unlocks: top * Math.max(shoes, 1),
    });
  }

  gaps.sort((a, b) => b.unlocks - a.unlocks);

  const neverWorn = items.filter((item) => {
    const record = wear.get(item.id);
    return !record || record.wears === 0;
  });

  const costLeaders = items
    .map((item) => {
      const price = Number(item.purchasePrice ?? 0);
      const wears = wear.get(item.id)?.wears ?? 0;
      if (!Number.isFinite(price) || price <= 0 || wears <= 0) return null;
      return { item, costPerWear: price / wears, wears };
    })
    .filter((entry): entry is CostLeader => Boolean(entry))
    .sort((a, b) => a.costPerWear - b.costPerWear)
    .slice(0, 3);

  const priced = costLeaders.map((entry) => entry.costPerWear);
  const averageCostPerWear =
    priced.length > 0
      ? priced.reduce((sum, value) => sum + value, 0) / priced.length
      : null;

  return {
    total: Object.values(safe).reduce((sum, value) => sum + value, 0),
    coverage: CATEGORIES.map((category) => ({
      category: category.value,
      label: category.label,
      count: safe[category.value],
    })),
    gaps,
    neverWorn,
    costLeaders,
    averageCostPerWear,
  };
}
