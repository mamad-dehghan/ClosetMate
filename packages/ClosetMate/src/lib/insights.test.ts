import { describe, expect, test } from "bun:test";
import { analyzeWardrobe, type InsightItem, type WearLite } from "./insights";
import type { CategoryCounts } from "./insights";

function counts(overrides: Partial<CategoryCounts> = {}): CategoryCounts {
  return {
    top: 0,
    bottom: 0,
    dress: 0,
    outerwear: 0,
    shoes: 0,
    accessory: 0,
    ...overrides,
  };
}

function item(overrides: Partial<InsightItem> & { id: string }): InsightItem {
  return {
    name: overrides.id,
    category: "top",
    primaryColor: "#1C1A17",
    purchasePrice: null,
    currency: "USD",
    ...overrides,
  };
}

const noWear = new Map<string, WearLite>();

describe("analyzeWardrobe", () => {
  test("an empty wardrobe reports the three blocking gaps", () => {
    const result = analyzeWardrobe({
      counts: counts(),
      items: [],
      wear: noWear,
    });

    const keys = result.gaps.map((gap) => gap.key);
    expect(keys).toContain("shoes");
    expect(keys).toContain("tops");
    expect(keys).toContain("bottoms");
  });

  test("a dress covers the top and bottom gaps", () => {
    const result = analyzeWardrobe({
      counts: counts({ dress: 2, shoes: 1 }),
      items: [],
      wear: noWear,
    });

    expect(result.gaps.map((gap) => gap.key)).toEqual([]);
  });

  test("missing shoes is ranked by the outfits it unlocks", () => {
    const result = analyzeWardrobe({
      counts: counts({ top: 3, bottom: 2, dress: 1 }),
      items: [],
      wear: noWear,
    });

    expect(result.gaps[0]?.key).toBe("shoes");
    expect(result.gaps[0]?.unlocks).toBe(7);
  });

  test("lists never-worn pieces", () => {
    const items = [
      item({ id: "worn" }),
      item({ id: "never" }),
      item({ id: "also-never" }),
    ];
    const wear = new Map<string, WearLite>([
      ["worn", { wears: 4, lastWorn: "2026-11-01" }],
    ]);

    const result = analyzeWardrobe({
      counts: counts({ top: 3, bottom: 1, shoes: 1 }),
      items,
      wear,
    });

    expect(result.neverWorn.map((entry) => entry.id)).toEqual([
      "never",
      "also-never",
    ]);
  });

  test("computes cost per wear for priced, worn items", () => {
    const items = [
      item({ id: "coat", purchasePrice: "200.00" }),
      item({ id: "tee", purchasePrice: "20.00" }),
      item({ id: "gift", purchasePrice: null }),
    ];
    const wear = new Map<string, WearLite>([
      ["coat", { wears: 10, lastWorn: "2026-11-02" }],
      ["tee", { wears: 40, lastWorn: "2026-11-10" }],
    ]);

    const result = analyzeWardrobe({
      counts: counts({ top: 1, outerwear: 1, bottom: 1, shoes: 1 }),
      items,
      wear,
    });

    expect(result.costLeaders[0]?.item.id).toBe("tee");
    expect(result.costLeaders[0]?.costPerWear).toBeCloseTo(0.5);
    expect(result.costLeaders.length).toBe(2);
    expect(result.averageCostPerWear).toBeCloseTo((20 + 0.5) / 2);
  });

  test("coverage mirrors the category counts", () => {
    const result = analyzeWardrobe({
      counts: counts({ top: 4, shoes: 2 }),
      items: [],
      wear: noWear,
    });

    expect(result.total).toBe(6);
    expect(result.coverage.find((entry) => entry.category === "top")?.count).toBe(4);
  });
});
