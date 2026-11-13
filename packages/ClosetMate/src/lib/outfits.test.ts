import { describe, expect, test } from "bun:test";
import {
  isoDate,
  monthGrid,
  outfitCover,
  outfitHarmony,
  shiftMonth,
  sortPiecesByCategory,
  todayISO,
} from "./outfits";

describe("sortPiecesByCategory", () => {
  test("orders outerwear, top, bottom, shoes", () => {
    const sorted = sortPiecesByCategory([
      { category: "shoes" },
      { category: "bottom" },
      { category: "outerwear" },
      { category: "top" },
    ]);
    expect(sorted.map((piece) => piece.category)).toEqual([
      "outerwear",
      "top",
      "bottom",
      "shoes",
    ]);
  });

  test("keeps unknown categories last", () => {
    const sorted = sortPiecesByCategory([
      { category: "hat" },
      { category: "top" },
    ]);
    expect(sorted[1]?.category).toBe("hat");
  });
});

describe("outfitHarmony", () => {
  test("needs two colours", () => {
    expect(outfitHarmony([{ primaryColor: "#1C1A17" }]).score).toBe(0);
  });

  test("scores a coherent outfit", () => {
    const result = outfitHarmony([
      { primaryColor: "#1C1A17" },
      { primaryColor: "#F4EFE6" },
      { primaryColor: "#3A3733" },
    ]);
    expect(result.score).toBeGreaterThan(70);
  });
});

describe("monthGrid", () => {
  test("always returns six weeks", () => {
    expect(monthGrid(2026, 2).length).toBe(42);
    expect(monthGrid(2026, 3).length).toBe(42);
  });

  test("March 2026 starts on a Monday cell index of 6", () => {
    const cells = monthGrid(2026, 3);
    expect(cells[6]?.day).toBe(1);
    expect(cells[6]?.iso).toBe("2026-03-01");
    expect(cells[5]?.iso).toBeNull();
  });

  test("February 2026 has 28 days", () => {
    const days = monthGrid(2026, 2).filter((cell) => cell.day !== null);
    expect(days.length).toBe(28);
    expect(days[0]?.iso).toBe("2026-02-01");
    expect(days[27]?.iso).toBe("2026-02-28");
  });
});

describe("date helpers", () => {
  test("isoDate pads month and day", () => {
    expect(isoDate(2026, 2, 3)).toBe("2026-02-03");
  });

  test("shiftMonth crosses year boundaries", () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });

  test("todayISO uses local components", () => {
    expect(todayISO(new Date(2026, 10, 13))).toBe("2026-11-13");
  });
});

describe("outfitCover", () => {
  test("limits and sorts the cover pieces", () => {
    const cover = outfitCover(
      [
        { imageUrl: "/a.svg", name: "a", category: "shoes" },
        { imageUrl: "/b.svg", name: "b", category: "top" },
        { imageUrl: "/c.svg", name: "c", category: "bottom" },
        { imageUrl: "/d.svg", name: "d", category: "outerwear" },
        { imageUrl: "/e.svg", name: "e", category: "accessory" },
      ],
      3,
    );
    expect(cover.map((piece) => piece.name)).toEqual(["d", "b", "c"]);
  });
});
