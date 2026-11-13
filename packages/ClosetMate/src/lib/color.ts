export type Hsl = { h: number; s: number; l: number };

export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase()}`;
  }
  if (/^[0-9a-f]{6}$/i.test(value)) return `#${value.toUpperCase()}`;
  return null;
}

export function hexToHsl(hex: string): Hsl {
  const normalized = normalizeHex(hex) ?? "#000000";
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  const s = delta / (1 - Math.abs(2 * l - 1));

  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h *= 60;
  if (h < 0) h += 360;

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const saturation = s / 100;
  const lightness = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const f = (n: number) =>
    lightness -
    a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (value: number) =>
    Math.round(255 * value)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

export function hueDistance(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export type ColorRelation =
  | "neutral"
  | "monochrome"
  | "analogous"
  | "complementary"
  | "triadic"
  | "contrast";

export type ColorHarmony = {
  score: number;
  relation: ColorRelation;
  label: string;
  detail: string;
};

const RELATION_COPY: Record<
  ColorRelation,
  { label: string; detail: string; base: number }
> = {
  neutral: {
    label: "Safe neutral",
    detail: "A neutral anchors the outfit and goes with almost anything.",
    base: 86,
  },
  monochrome: {
    label: "Monochrome",
    detail: "Same hue, different depth — calm and intentional.",
    base: 90,
  },
  analogous: {
    label: "Analogous",
    detail: "Neighbouring hues on the color wheel — soft and cohesive.",
    base: 88,
  },
  complementary: {
    label: "Complementary",
    detail: "Opposite hues create a confident, high-contrast pairing.",
    base: 80,
  },
  triadic: {
    label: "Triadic",
    detail: "Three evenly spaced hues — playful, needs a neutral anchor.",
    base: 72,
  },
  contrast: {
    label: "High contrast",
    detail: "Unrelated hues. Works as a statement, risky for a full outfit.",
    base: 48,
  },
};

/**
 * Deterministic colour-theory pairing. No AI, no network:
 * hue distance + saturation/lightness balance.
 */
export function harmonyBetween(
  hexA: string,
  hexB: string,
): ColorHarmony {
  const a = hexToHsl(hexA);
  const b = hexToHsl(hexB);

  const neutralA = a.s < 14 || a.l < 8 || a.l > 92;
  const neutralB = b.s < 14 || b.l < 8 || b.l > 92;

  let relation: ColorRelation;
  if (neutralA || neutralB) {
    const other = neutralA ? b : a;
    if (other.s < 14) relation = "monochrome";
    else relation = "neutral";
  } else {
    const distance = hueDistance(a.h, b.h);
    if (distance <= 15) relation = "monochrome";
    else if (distance <= 45) relation = "analogous";
    else if (distance >= 155) relation = "complementary";
    else if (distance >= 100) relation = "triadic";
    else relation = "contrast";
  }

  const copy = RELATION_COPY[relation];
  let score = copy.base;

  // Very saturated pairs need more neutral support.
  if (a.s > 70 && b.s > 70 && relation === "contrast") score -= 12;
  if (relation === "complementary" && Math.abs(a.l - b.l) > 55) score += 4;
  if (relation === "monochrome" && Math.abs(a.l - b.l) < 12) score -= 6;

  return {
    score: Math.max(10, Math.min(100, Math.round(score))),
    relation,
    label: copy.label,
    detail: copy.detail,
  };
}

export type ColorMatch<T> = {
  item: T;
  harmony: ColorHarmony;
};

export function rankByHarmony<T extends { primaryColor: string | null }>(
  baseHex: string | null,
  candidates: T[],
  limit = 3,
): ColorMatch<T>[] {
  if (!baseHex) return [];
  return candidates
    .filter((candidate) => Boolean(candidate.primaryColor))
    .map((item) => ({
      item,
      harmony: harmonyBetween(baseHex, item.primaryColor as string),
    }))
    .sort((x, y) => y.harmony.score - x.harmony.score)
    .slice(0, limit);
}

/** Score a whole outfit: average of every pair, with a small variance bonus. */
export function harmonyForColors(hexes: (string | null)[]) {
  const colors = hexes.filter((hex): hex is string => Boolean(hex));
  if (colors.length < 2) {
    return { score: 0, label: "Add more pieces", detail: "Two or more items needed." };
  }

  let total = 0;
  let pairs = 0;
  const relations = new Set<ColorRelation>();

  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      const result = harmonyBetween(colors[i] as string, colors[j] as string);
      total += result.score;
      pairs += 1;
      relations.add(result.relation);
    }
  }

  const score = Math.round(total / pairs);
  let label = "Balanced";
  if (relations.has("contrast") && relations.size > 2) label = "Bold mix";
  else if (relations.has("monochrome") || relations.has("analogous")) {
    label = "Cohesive";
  } else if (relations.has("complementary")) label = "Contrasted";

  return {
    score,
    label,
    detail:
      relations.size > 2
        ? "Several colour families together — anchor with a neutral."
        : "Colours relate to each other on the wheel.",
  };
}
