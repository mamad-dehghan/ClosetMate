import type { Item } from "@/db/schema";
import { harmonyBetween } from "./color";

export type Suggestion = {
  items: Item[];
  score: number;
  label: string;
};

function available(items: Item[]) {
  return items.filter((item) => item.laundryStatus === "available");
}

function byCategory(items: Item[], category: string) {
  return items.filter((item) => item.category === category);
}

/**
 * Deterministic "what should I wear" pick: the top/bottom pair with the best
 * colour relationship, plus the shoes that agree with both. No AI, and it
 * always finishes instantly.
 */
export function suggestOutfit(all: Item[]): Suggestion | null {
  const items = available(all);
  const tops = byCategory(items, "top").slice(0, 24);
  const bottoms = byCategory(items, "bottom").slice(0, 24);
  const shoes = byCategory(items, "shoes").slice(0, 24);
  const dresses = byCategory(items, "dress").slice(0, 24);
  const outerwear = byCategory(items, "outerwear").slice(0, 24);

  let best: { base: Item[]; score: number } | null = null;

  for (const top of tops) {
    for (const bottom of bottoms) {
      const score = top.primaryColor && bottom.primaryColor
        ? harmonyBetween(top.primaryColor, bottom.primaryColor).score
        : 55;
      if (!best || score > best.score) best = { base: [top, bottom], score };
    }
  }

  if (!best) {
    for (const dress of dresses) {
      const score = shoes[0]?.primaryColor && dress.primaryColor
        ? harmonyBetween(dress.primaryColor, shoes[0].primaryColor).score
        : 60;
      if (!best || score > best.score) best = { base: [dress], score };
    }
  }

  if (!best) {
    const fallback = items.slice(0, 3);
    if (fallback.length < 2) return null;
    return { items: fallback, score: 55, label: "A starting point" };
  }

  let chosenShoe: Item | null = null;
  let bestShoeScore = -1;
  for (const shoe of shoes) {
    if (!shoe.primaryColor) continue;
    const total =
      best.base.reduce((sum, piece) => {
        if (!piece.primaryColor) return sum + 55;
        return sum + harmonyBetween(piece.primaryColor, shoe.primaryColor as string).score;
      }, 0) / best.base.length;
    if (total > bestShoeScore) {
      bestShoeScore = total;
      chosenShoe = shoe;
    }
  }

  const pieces = [...best.base];
  if (chosenShoe) pieces.push(chosenShoe);

  const layer = outerwear.find(
    (coat) =>
      coat.primaryColor &&
      pieces.every(
        (piece) =>
          !piece.primaryColor ||
          harmonyBetween(coat.primaryColor as string, piece.primaryColor).score >= 60,
      ),
  );
  if (layer) pieces.push(layer);

  const score = chosenShoe ? Math.round(bestShoeScore) : best.score;

  return {
    items: pieces,
    score: Math.max(35, Math.min(97, score)),
    label:
      score >= 82
        ? "Colours agree on the wheel"
        : score >= 68
          ? "A balanced combination"
          : "A safe everyday pick",
  };
}
