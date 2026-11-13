import { describe, expect, test } from "bun:test";
import { countsFromItems, outfitCapacity, versatilityFor } from "./versatility";
import type { Category } from "./categories";

const counts = {
  top: 3,
  bottom: 2,
  dress: 1,
  outerwear: 1,
  shoes: 2,
  accessory: 0,
} as Record<Category, number>;

describe("outfitCapacity", () => {
  test("counts top/bottom pairs plus dresses, times shoes", () => {
    expect(outfitCapacity(counts)).toBe((3 * 2 + 1) * 2);
  });

  test("is zero without shoes or bases", () => {
    expect(
      outfitCapacity({
        top: 0,
        bottom: 0,
        dress: 0,
        outerwear: 0,
        shoes: 0,
        accessory: 0,
      }),
    ).toBe(0);
  });
});

describe("versatilityFor", () => {
  test("a top combines bottoms and shoes", () => {
    const result = versatilityFor({ category: "top" }, counts);
    expect(result.combinations).toBeGreaterThanOrEqual(4);
    expect(result.score).toBeGreaterThan(0);
  });

  test("accessories are versatile when the base wardrobe is full", () => {
    const accessory = versatilityFor({ category: "accessory" }, counts);
    const dress = versatilityFor({ category: "dress" }, counts);
    expect(accessory.score).toBeGreaterThanOrEqual(dress.score);
  });

  test("an item with no partners reports zero", () => {
    const result = versatilityFor(
      { category: "top" },
      {
        top: 1,
        bottom: 0,
        dress: 0,
        outerwear: 0,
        shoes: 0,
        accessory: 0,
      },
    );
    expect(result.combinations).toBe(0);
    expect(result.score).toBe(0);
    expect(result.label).toBe("Rarely used");
  });
});

describe("countsFromItems", () => {
  test("groups items by category and ignores unknown values", () => {
    const result = countsFromItems([
      { category: "top" },
      { category: "top" },
      { category: "shoes" },
      { category: "jumpsuit" },
    ]);
    expect(result.top).toBe(2);
    expect(result.shoes).toBe(1);
    expect(result.bottom).toBe(0);
  });
});
