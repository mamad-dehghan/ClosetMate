import { describe, expect, test } from "bun:test";
import { defaultItemName, colorName } from "./categories";
import { itemFiltersSchema, itemInputSchema } from "./validation";

describe("itemInputSchema", () => {
  test("accepts the quick-add minimum", () => {
    const result = itemInputSchema.safeParse({
      name: "Ivory tee",
      category: "top",
    });
    expect(result.success).toBe(true);
  });

  test("accepts an empty name — photo and category are enough", () => {
    const result = itemInputSchema.safeParse({
      name: "",
      category: "bottom",
      primaryColor: "#1C1A17",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("");
  });

  test("accepts a missing name field", () => {
    const result = itemInputSchema.safeParse({
      category: "shoes",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("");
  });

  test("rejects an unknown category", () => {
    const result = itemInputSchema.safeParse({
      name: "Something",
      category: "jumpsuit",
    });
    expect(result.success).toBe(false);
  });

  test("rejects a malformed colour", () => {
    const result = itemInputSchema.safeParse({
      name: "Tee",
      category: "top",
      primaryColor: "blue",
    });
    expect(result.success).toBe(false);
  });

  test("accepts short hex and normalises empty strings away", () => {
    const result = itemInputSchema.safeParse({
      name: "Tee",
      category: "top",
      primaryColor: "#c63",
      brand: "",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.brand).toBeUndefined();
      expect(result.data.notes).toBeUndefined();
    }
  });

  test("coerces prices to two decimals", () => {
    const result = itemInputSchema.safeParse({
      name: "Tee",
      category: "top",
      purchasePrice: "45.5",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.purchasePrice).toBe("45.50");
  });

  test("drops invalid prices instead of failing", () => {
    const result = itemInputSchema.safeParse({
      name: "Tee",
      category: "top",
      purchasePrice: "lots",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.purchasePrice).toBeUndefined();
  });

  test("defaults laundry status and favourite", () => {
    const result = itemInputSchema.safeParse({
      name: "Tee",
      category: "top",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.laundryStatus).toBe("available");
      expect(result.data.favorite).toBe(false);
      expect(result.data.seasons).toEqual([]);
    }
  });
});

describe("defaultItemName", () => {
  test("uses the colour name and category", () => {
    expect(defaultItemName("top", "#F4EFE6")).toBe("Ivory top");
  });

  test("falls back to the category when no colour is set", () => {
    expect(defaultItemName("outerwear", null)).toBe("Outerwear");
  });

  test("keeps an unknown hex readable instead of empty", () => {
    expect(defaultItemName("shoes", "#123456")).toBe("#123456 shoes");
  });

  test("every category produces a non-empty name", () => {
    for (const category of ["top", "bottom", "dress", "outerwear", "shoes", "accessory"]) {
      expect(defaultItemName(category, "#1C1A17").length).toBeGreaterThan(0);
    }
  });
});

describe("colorName", () => {
  test("maps palette hexes to names", () => {
    expect(colorName("#c4633f")).toBe("Terracotta");
  });

  test("returns the hex when it is not in the palette", () => {
    expect(colorName("#123456")).toBe("#123456");
  });
});

describe("itemFiltersSchema", () => {
  test("accepts empty filters", () => {
    expect(itemFiltersSchema.safeParse({}).success).toBe(true);
  });

  test("rejects an unknown sort", () => {
    expect(itemFiltersSchema.safeParse({ sort: "colourful" }).success).toBe(
      false,
    );
  });
});
