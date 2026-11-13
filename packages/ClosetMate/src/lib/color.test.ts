import { describe, expect, test } from "bun:test";
import { harmonyBetween, harmonyForColors, hexToHsl, normalizeHex } from "./color";

describe("normalizeHex", () => {
  test("expands short hex values", () => {
    expect(normalizeHex("#c63")).toBe("#CC6633");
  });

  test("rejects invalid input", () => {
    expect(normalizeHex("nope")).toBeNull();
  });
});

describe("hexToHsl", () => {
  test("reads pure red", () => {
    expect(hexToHsl("#FF0000")).toEqual({ h: 0, s: 100, l: 50 });
  });

  test("reads grey as unsaturated", () => {
    expect(hexToHsl("#808080").s).toBe(0);
  });
});

describe("harmonyBetween", () => {
  test("neutrals pair safely with saturated colours", () => {
    const result = harmonyBetween("#F4EFE6", "#C4633F");
    expect(result.relation).toBe("neutral");
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  test("similar hues are monochrome or analogous", () => {
    const result = harmonyBetween("#C4633F", "#D98A6A");
    expect(["monochrome", "analogous"]).toContain(result.relation);
  });

  test("opposite hues are complementary", () => {
    const result = harmonyBetween("#2B3A55", "#B08968");
    expect(result.relation).toBe("complementary");
  });

  test("unrelated hues are flagged as contrast", () => {
    const result = harmonyBetween("#6B7345", "#C4633F");
    expect(result.relation).toBe("contrast");
    expect(result.score).toBeLessThan(70);
  });
});

describe("harmonyForColors", () => {
  test("needs at least two colours", () => {
    expect(harmonyForColors(["#000000"]).score).toBe(0);
  });

  test("scores a calm outfit higher than a clashing one", () => {
    const calm = harmonyForColors(["#1C1A17", "#F4EFE6", "#3A3733"]);
    const loud = harmonyForColors(["#6B7345", "#C3B4D6", "#A9552F"]);
    expect(calm.score).toBeGreaterThan(loud.score);
  });
});
