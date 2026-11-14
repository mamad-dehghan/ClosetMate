import { describe, expect, test } from "bun:test";
import { buildRemixSlots, remixHarmony } from "./remix";
import { makeItem } from "./test-fixtures";

const base = [
  makeItem({ id: "tee", category: "top", primaryColor: "#F4EFE6" }),
  makeItem({ id: "jeans", category: "bottom", primaryColor: "#4A6C8C" }),
  makeItem({ id: "sneakers", category: "shoes", primaryColor: "#1C1A17" }),
];

describe("buildRemixSlots", () => {
  test("offers alternatives in the same category only", () => {
    const all = [
      ...base,
      makeItem({ id: "shirt", category: "top", primaryColor: "#A8C3D9" }),
      makeItem({ id: "chinos", category: "bottom", primaryColor: "#D8C3A5" }),
      makeItem({ id: "boots", category: "shoes", primaryColor: "#7A5230" }),
    ];

    const slots = buildRemixSlots(base, all);
    expect(slots.length).toBe(3);

    for (const slot of slots) {
      for (const alternative of slot.alternatives) {
        expect(alternative.item.category).toBe(slot.base.category);
        expect(base.some((piece) => piece.id === alternative.item.id)).toBe(
          false,
        );
      }
    }
  });

  test("ranks the safest swap first", () => {
    const all = [
      ...base,
      makeItem({ id: "match", category: "top", primaryColor: "#F4EFE6" }),
      makeItem({ id: "clash", category: "top", primaryColor: "#6B7345" }),
    ];

    const topSlot = buildRemixSlots(base, all).find(
      (slot) => slot.base.id === "tee",
    );
    expect(topSlot?.alternatives[0]?.item.id).toBe("match");
  });

  test("respects the limit and laundry status", () => {
    const all = [
      ...base,
      makeItem({ id: "a", category: "top" }),
      makeItem({ id: "b", category: "top" }),
      makeItem({ id: "c", category: "top" }),
      makeItem({ id: "d", category: "top" }),
      makeItem({ id: "e", category: "top", laundryStatus: "laundry" }),
    ];

    const slot = buildRemixSlots(base, all, 2).find(
      (entry) => entry.base.id === "tee",
    );
    expect(slot?.alternatives.length).toBe(2);
    expect(slot?.alternatives.map((entry) => entry.item.id)).not.toContain("e");
  });
});

describe("remixHarmony", () => {
  test("scores a monochrome set high", () => {
    expect(remixHarmony(base)).toBeGreaterThan(60);
  });

  test("returns zero for a single colour", () => {
    expect(remixHarmony([{ primaryColor: "#000000" }])).toBe(0);
  });
});
