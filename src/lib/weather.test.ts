import { describe, expect, test } from "bun:test";
import { seasonForTemperature, weatherLabel } from "./weather";

describe("seasonForTemperature", () => {
  test("cold is winter", () => {
    expect(seasonForTemperature(-5, 4)).toBe("winter");
    expect(seasonForTemperature(4, 12)).toBe("winter");
  });

  test("mild spring and autumn follow the month", () => {
    expect(seasonForTemperature(14, 4)).toBe("spring");
    expect(seasonForTemperature(14, 10)).toBe("autumn");
  });

  test("warm is summer", () => {
    expect(seasonForTemperature(28, 7)).toBe("summer");
    expect(seasonForTemperature(24, 1)).toBe("summer");
  });
});

describe("weatherLabel", () => {
  test("maps known WMO codes", () => {
    expect(weatherLabel(0)).toBe("Clear");
    expect(weatherLabel(63)).toBe("Rain");
  });

  test("falls back for unknown codes", () => {
    expect(weatherLabel(199)).toBe("Unsettled");
  });
});
