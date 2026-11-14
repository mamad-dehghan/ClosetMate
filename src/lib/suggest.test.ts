import { describe, expect, test } from "bun:test";
import { suggestOutfit, suggestionSignature } from "./suggest";
import { makeItem } from "./test-fixtures";

const wardrobe = [
  makeItem({ id: "tee", category: "top", primaryColor: "#F4EFE6" }),
  makeItem({ id: "shirt", category: "top", primaryColor: "#A8C3D9" }),
  makeItem({ id: "jeans", category: "bottom", primaryColor: "#4A6C8C" }),
  makeItem({ id: "sneakers", category: "shoes", primaryColor: "#F4EFE6" }),
  makeItem({ id: "coat", category: "outerwear", primaryColor: "#B08968" }),
];

describe("suggestionSignature", () => {
  test("is independent of order", () => {
    expect(suggestionSignature([{ id: "b" }, { id: "a" }])).toBe("a|b");
  });
});

describe("suggestOutfit", () => {
  test("builds a complete outfit", () => {
    const suggestion = suggestOutfit(wardrobe);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.items.length).toBeGreaterThanOrEqual(3);
    expect(suggestion?.score).toBeGreaterThan(0);
  });

  test("skips a rejected combination and returns null when exhausted", () => {
    const first = suggestOutfit(wardrobe);
    expect(first).not.toBeNull();
    if (!first) return;

    const rejected = new Set([suggestionSignature(first.items)]);
    const second = suggestOutfit(wardrobe, { exclude: rejected });

    // With one top/bottom combination per pair there is still another top,
    // so a second idea should exist and must differ.
    expect(second).not.toBeNull();
    if (!second) return;
    expect(suggestionSignature(second.items)).not.toBe(
      suggestionSignature(first.items),
    );
  });

  test("returns null when every combination was rejected", () => {
    const minimal = [
      makeItem({ id: "one-top", category: "top" }),
      makeItem({ id: "one-bottom", category: "bottom" }),
      makeItem({ id: "one-shoe", category: "shoes" }),
    ];

    const first = suggestOutfit(minimal);
    expect(first).not.toBeNull();
    if (!first) return;

    const result = suggestOutfit(minimal, {
      exclude: new Set([suggestionSignature(first.items)]),
    });
    expect(result).toBeNull();
  });

  test("filters by season but keeps untagged pieces", () => {
    const seasonal = [
      makeItem({
        id: "winter-top",
        category: "top",
        seasons: ["winter"],
        primaryColor: "#3A3733",
      }),
      makeItem({
        id: "summer-top",
        category: "top",
        seasons: ["summer"],
        primaryColor: "#A8C3D9",
      }),
      makeItem({ id: "any-bottom", category: "bottom", primaryColor: "#1C1A17" }),
      makeItem({ id: "any-shoe", category: "shoes", primaryColor: "#F4EFE6" }),
    ];

    const winter = suggestOutfit(seasonal, { season: "winter" });
    expect(winter?.items.map((item) => item.id)).toContain("winter-top");
    expect(winter?.items.map((item) => item.id)).not.toContain("summer-top");
  });

  test("ignores pieces that are in the wash", () => {
    const dirty = [
      makeItem({ id: "clean-top", category: "top" }),
      makeItem({ id: "dirty-top", category: "top", laundryStatus: "laundry" }),
      makeItem({ id: "clean-bottom", category: "bottom" }),
      makeItem({ id: "clean-shoe", category: "shoes" }),
    ];

    const suggestion = suggestOutfit(dirty);
    const ids = suggestion?.items.map((item) => item.id) ?? [];
    expect(ids).not.toContain("dirty-top");
  });
});
