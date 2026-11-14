import type { Item } from "@/db/schema";
import { harmonyBetween } from "./color";

export type RemixAlternative = {
  item: Item;
  score: number;
  label: string;
};

export type RemixSlot = {
  base: Item;
  alternatives: RemixAlternative[];
};

/**
 * For each piece in an outfit, ranks the other wardrobe pieces of the same
 * category by how well they sit with the remaining pieces. This is the whole
 * "change one thing" idea, with no AI involved.
 */
export function buildRemixSlots(
  base: Item[],
  all: Item[],
  limit = 4,
): RemixSlot[] {
  return base.map((piece) => {
    const others = base.filter((entry) => entry.id !== piece.id);
    const coloredOthers = others.filter((entry) => entry.primaryColor);

    const alternatives = all
      .filter(
        (item) =>
          item.category === piece.category &&
          item.id !== piece.id &&
          item.laundryStatus === "available" &&
          !base.some((entry) => entry.id === item.id),
      )
      .map((item) => {
        if (coloredOthers.length === 0 || !item.primaryColor) {
          return { item, score: 65, label: "Neutral choice" };
        }

        let total = 0;
        let weakest = { score: 100, label: "Neutral choice" };

        for (const other of coloredOthers) {
          const harmony = harmonyBetween(
            other.primaryColor as string,
            item.primaryColor,
          );
          total += harmony.score;
          if (harmony.score < weakest.score) {
            weakest = { score: harmony.score, label: harmony.label };
          }
        }

        return {
          item,
          score: Math.round(total / coloredOthers.length),
          label: weakest.label,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return { base: piece, alternatives };
  });
}

export function remixHarmony(pieces: { primaryColor: string | null }[]) {
  const colors = pieces
    .map((piece) => piece.primaryColor)
    .filter((color): color is string => Boolean(color));

  if (colors.length < 2) return 0;

  let total = 0;
  let pairs = 0;

  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      total += harmonyBetween(colors[i] as string, colors[j] as string).score;
      pairs += 1;
    }
  }

  return Math.round(total / pairs);
}
