import { describe, expect, test } from "bun:test";
import { capsuleSummary } from "./capsules";

describe("capsuleSummary", () => {
  test("counts outfits and coverage", () => {
    const summary = capsuleSummary(
      [
        { category: "top" },
        { category: "top" },
        { category: "bottom" },
        { category: "shoes" },
      ],
      20,
    );

    expect(summary.total).toBe(4);
    expect(summary.capacity).toBe(2);
    expect(summary.coverage).toBe(20);
    expect(summary.missing).toEqual([]);
  });

  test("reports missing base categories", () => {
    const summary = capsuleSummary([{ category: "top" }, { category: "bottom" }], 10);
    expect(summary.missing).toContain("shoes");
    expect(summary.capacity).toBe(0);
  });

  test("handles an empty wardrobe", () => {
    const summary = capsuleSummary([], 0);
    expect(summary.coverage).toBe(0);
    expect(summary.missing.length).toBeGreaterThan(0);
  });
});
