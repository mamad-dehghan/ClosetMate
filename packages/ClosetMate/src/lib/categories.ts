export const CATEGORIES = [
  { value: "top", label: "Tops", singular: "Top", plural: "tops" },
  { value: "bottom", label: "Bottoms", singular: "Bottom", plural: "bottoms" },
  { value: "dress", label: "Dresses", singular: "Dress", plural: "dresses" },
  {
    value: "outerwear",
    label: "Outerwear",
    singular: "Outerwear",
    plural: "outerwear",
  },
  { value: "shoes", label: "Shoes", singular: "Shoes", plural: "shoes" },
  {
    value: "accessory",
    label: "Accessories",
    singular: "Accessory",
    plural: "accessories",
  },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [
  Category,
  ...Category[],
];

export function categoryMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[0];
}

/** Canonical display order for a complete outfit. */
export const OUTFIT_ORDER: Category[] = [
  "outerwear",
  "top",
  "dress",
  "bottom",
  "shoes",
  "accessory",
];

export const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
] as const;

export const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "formal", label: "Formal" },
  { value: "sport", label: "Sport" },
  { value: "travel", label: "Travel" },
  { value: "evening", label: "Evening" },
] as const;

export const PATTERNS = [
  "solid",
  "stripe",
  "check",
  "floral",
  "print",
  "denim",
  "knit",
  "textured",
  "other",
] as const;

export const LAUNDRY_STATUSES = [
  { value: "available", label: "Ready to wear" },
  { value: "laundry", label: "In the wash" },
  { value: "repair", label: "Needs repair" },
] as const;

/** A curated, easy-to-name palette used by the color picker. */
export const COLOR_SWATCHES = [
  { name: "Ivory", hex: "#F4EFE6" },
  { name: "Cream", hex: "#EADFCB" },
  { name: "Sand", hex: "#D8C3A5" },
  { name: "Camel", hex: "#B08968" },
  { name: "Rust", hex: "#A9552F" },
  { name: "Terracotta", hex: "#C4633F" },
  { name: "Burgundy", hex: "#6E2B34" },
  { name: "Black", hex: "#1C1A17" },
  { name: "Charcoal", hex: "#3A3733" },
  { name: "Grey", hex: "#8B857C" },
  { name: "Slate", hex: "#5C6670" },
  { name: "Navy", hex: "#2B3A55" },
  { name: "Denim", hex: "#4A6C8C" },
  { name: "Sky", hex: "#A8C3D9" },
  { name: "Sage", hex: "#93A186" },
  { name: "Olive", hex: "#6B7345" },
  { name: "Forest", hex: "#33493A" },
  { name: "Butter", hex: "#E9CE8F" },
  { name: "Blush", hex: "#E3BDB5" },
  { name: "Lilac", hex: "#C3B4D6" },
] as const;

export function colorName(hex: string | null | undefined) {
  if (!hex) return null;
  const normalized = hex.toUpperCase();
  const exact = COLOR_SWATCHES.find(
    (swatch) => swatch.hex.toUpperCase() === normalized,
  );
  return exact?.name ?? normalized;
}

/**
 * Name used when the user leaves the name field empty. Always returns
 * something readable, so "photo + category" really is enough to save.
 */
export function defaultItemName(
  category: string,
  color?: string | null,
) {
  const meta = categoryMeta(category);
  const shade = colorName(color);
  return shade ? `${shade} ${meta.singular.toLowerCase()}` : meta.singular;
}
