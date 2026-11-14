import { describe, expect, test } from "bun:test";
import { buildPackingPlan } from "./packing";
import { makeItem } from "./test-fixtures";

const wardrobe = [
  makeItem({ id: "tee", category: "top", seasons: ["summer"], occasions: ["casual"] }),
  makeItem({ id: "shirt", category: "top", seasons: ["summer"], occasions: ["work"] }),
  makeItem({ id: "sweater", category: "top", seasons: ["winter"], occasions: ["casual"] }),
  makeItem({ id: "jeans", category: "bottom", seasons: ["autumn", "winter"] }),
  makeItem({ id: "shorts", category: "bottom", seasons: ["summer"] }),
  makeItem({ id: "sneakers", category: "shoes", seasons: ["summer"] }),
  makeItem({ id: "boots", category: "shoes", seasons: ["winter"] }),
  makeItem({ id: "coat", category: "outerwear", seasons: ["winter"] }),
  makeItem({ id: "dress", category: "dress", seasons: ["summer"] }),
  makeItem({ id: "tote", category: "accessory" }),
  makeItem({ id: "dirty-top", category: "top", laundryStatus: "laundry" }),
];

describe("buildPackingPlan", () => {
  test("packs a minimal warm-weather list", () => {
    const plan = buildPackingPlan(wardrobe, {
      days: 4,
      band: "warm",
      occasion: "casual",
    });

    const ids = plan.groups.flatMap((group) => group.items.map((item) => item.id));
    expect(ids).toContain("tee");
    expect(ids).not.toContain("sweater");
    expect(ids).not.toContain("coat");
    expect(ids).not.toContain("dirty-top");
    expect(plan.outfits).toBeGreaterThan(0);
  });

  test("adds an outer layer when cold", () => {
    const plan = buildPackingPlan(wardrobe, {
      days: 3,
      band: "cold",
      occasion: "casual",
    });

    const ids = plan.groups.flatMap((group) => group.items.map((item) => item.id));
    expect(ids).toContain("coat");
    expect(ids).toContain("boots");
  });

  test("never exceeds the trip length for tops", () => {
    const plan = buildPackingPlan(wardrobe, {
      days: 2,
      band: "warm",
      occasion: "casual",
    });

    const tops = plan.groups.find((group) => group.category === "top");
    expect((tops?.items.length ?? 0) <= 2).toBe(true);
  });

  test("returns an empty plan when nothing matches", () => {
    const plan = buildPackingPlan(
      [makeItem({ id: "snow", category: "top", seasons: ["winter"] })],
      { days: 5, band: "warm", occasion: "formal" },
    );

    expect(plan.groups.length).toBe(0);
    expect(plan.notes.some((note) => note.includes("Nothing"))).toBe(true);
  });
});
