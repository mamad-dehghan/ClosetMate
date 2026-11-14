import type { Item } from "@/db/schema";
import { harmonyBetween } from "./color";

export type Suggestion = {
  items: Item[];
  score: number;
  label: string;
};

export type SuggestOptions = {
  /** Favour pieces tagged for this season; untagged pieces always qualify. */
  season?: string | null;
  /** Signatures the user already rejected today. */
  exclude?: Set<string>;
};

/** Stable identity for a set of pieces, independent of order. */
export function suggestionSignature(items: { id: string }[]) {
  return items
    .map((item) => item.id)
    .sort()
    .join("|");
}

function available(items: Item[], season?: string | null) {
  return items.filter((item) => {
    if (item.laundryStatus !== "available") return false;
    if (!season) return true;
    return item.seasons.length === 0 || item.seasons.includes(season);
  });
}

function byCategory(items: Item[], category: string) {
  return items.filter((item) => item.category === category);
}

function averageHarmony(base: Item[], candidate: Item) {
  if (!candidate.primaryColor) return 55;
  const colored = base.filter((piece) => piece.primaryColor);
  if (colored.length === 0) return 60;

  const total = colored.reduce(
    (sum, piece) =>
      sum +
      harmonyBetween(
        piece.primaryColor as string,
        candidate.primaryColor as string,
      ).score,
    0,
  );

  return total / colored.length;
}

function assemble(base: Item[], shoes: Item[], outerwear: Item[]) {
  let bestShoe: Item | null = null;
  let bestShoeScore = -1;

  for (const shoe of shoes) {
    if (!shoe.primaryColor) continue;
    if (base.some((piece) => piece.id === shoe.id)) continue;
    const score = averageHarmony(base, shoe);
    if (score > bestShoeScore) {
      bestShoeScore = score;
      bestShoe = shoe;
    }
  }

  const pieces = [...base];
  if (bestShoe) pieces.push(bestShoe);

  const layer = outerwear.find(
    (coat) =>
      !pieces.some((piece) => piece.id === coat.id) &&
      pieces.every(
        (piece) =>
          !piece.primaryColor ||
          !coat.primaryColor ||
          harmonyBetween(coat.primaryColor, piece.primaryColor).score >= 60,
      ),
  );
  if (layer) pieces.push(layer);

  return {
    items: pieces,
    score: bestShoeScore >= 0 ? Math.round(bestShoeScore) : 62,
  };
}

function labelFor(score: number) {
  if (score >= 82) return "Colours agree on the wheel";
  if (score >= 68) return "A balanced combination";
  return "A safe everyday pick";
}

/**
 * Deterministic "what should I wear" pick: the top/bottom pair with the best
 * colour relationship, plus the shoes that agree with both. Rejected
 * signatures are skipped so "Remix" can offer the next best idea.
 */
export function suggestOutfit(
  all: Item[],
  options: SuggestOptions = {},
): Suggestion | null {
  const items = available(all, options.season);
  const exclude = options.exclude ?? new Set<string>();

  const tops = byCategory(items, "top").slice(0, 24);
  const bottoms = byCategory(items, "bottom").slice(0, 24);
  const shoes = byCategory(items, "shoes").slice(0, 24);
  const dresses = byCategory(items, "dress").slice(0, 24);
  const outerwear = byCategory(items, "outerwear").slice(0, 24);

  const candidates: { base: Item[]; score: number }[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      const score =
        top.primaryColor && bottom.primaryColor
          ? harmonyBetween(top.primaryColor, bottom.primaryColor).score
          : 55;
      candidates.push({ base: [top, bottom], score });
    }
  }

  for (const dress of dresses) {
    candidates.push({ base: [dress], score: 62 });
  }

  candidates.sort((a, b) => b.score - a.score);

  for (const candidate of candidates.slice(0, 240)) {
    const outfit = assemble(candidate.base, shoes, outerwear);
    if (exclude.has(suggestionSignature(outfit.items))) continue;

    const score = Math.max(35, Math.min(97, outfit.score));
    return {
      items: outfit.items,
      score,
      label: labelFor(score),
    };
  }

  // Nothing complete is available — offer a starting point instead.
  if (candidates.length > 0) return null;

  const fallback = items.slice(0, 3);
  if (
    fallback.length >= 2 &&
    !exclude.has(suggestionSignature(fallback))
  ) {
    return { items: fallback, score: 55, label: "A starting point" };
  }

  return null;
}
