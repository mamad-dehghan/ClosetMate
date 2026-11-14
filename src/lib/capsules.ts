import type { Category } from "./categories";
import { countsFromItems, type CategoryCounts } from "./versatility";

export type CapsuleSummary = {
  counts: CategoryCounts;
  capacity: number;
  coverage: number;
  missing: Category[];
  total: number;
};

/**
 * How much of the wardrobe a capsule uses, how many outfits it can make, and
 * which base categories are absent.
 */
export function capsuleSummary(
  pieces: { category: string }[],
  wardrobeTotal: number,
): CapsuleSummary {
  const counts = countsFromItems(pieces);
  // Capsules must be wearable on their own: no shoes means no complete outfit.
  const capacity =
    counts.shoes > 0
      ? (counts.top * counts.bottom + counts.dress) * counts.shoes
      : 0;
  const coverage =
    wardrobeTotal > 0
      ? Math.min(100, Math.round((pieces.length / wardrobeTotal) * 100))
      : 0;

  const missing: Category[] = [];
  if (counts.shoes === 0) missing.push("shoes");
  if (counts.top === 0 && counts.dress === 0) missing.push("top");
  if (counts.bottom === 0 && counts.dress === 0) missing.push("bottom");

  return {
    counts,
    capacity,
    coverage,
    missing,
    total: pieces.length,
  };
}
