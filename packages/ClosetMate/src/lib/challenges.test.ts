import { describe, expect, test } from "bun:test";
import { evaluateChallenges } from "./challenges";

describe("evaluateChallenges", () => {
  test("reports incomplete progress", () => {
    const result = evaluateChallenges({
      wearsThisWeek: 1,
      outfitsThisWeek: 0,
      capsules: 0,
    });

    expect(result.every((challenge) => !challenge.complete)).toBe(true);
    expect(result.find((entry) => entry.key === "wear-three")?.progress).toBe(1);
  });

  test("completes when the target is reached", () => {
    const result = evaluateChallenges({
      wearsThisWeek: 3,
      outfitsThisWeek: 1,
      capsules: 0,
    });

    expect(result.find((entry) => entry.key === "wear-three")?.complete).toBe(true);
    expect(result.find((entry) => entry.key === "fresh-outfit")?.complete).toBe(true);
    expect(result.find((entry) => entry.key === "build-capsule")?.complete).toBe(false);
  });

  test("keeps a stored completion even if progress drops", () => {
    const result = evaluateChallenges(
      { wearsThisWeek: 0, outfitsThisWeek: 0, capsules: 0 },
      new Map([["wear-three", "2026-11-10"]]),
    );

    const challenge = result.find((entry) => entry.key === "wear-three");
    expect(challenge?.complete).toBe(true);
    expect(challenge?.completedOn).toBe("2026-11-10");
  });
});
