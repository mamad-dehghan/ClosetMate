export type ChallengeKey = "wear-three" | "fresh-outfit" | "build-capsule";

export type ChallengeInput = {
  wearsThisWeek: number;
  outfitsThisWeek: number;
  capsules: number;
};

export type Challenge = {
  key: ChallengeKey;
  title: string;
  description: string;
  target: number;
  progress: number;
  unit: string;
  complete: boolean;
  completedOn: string | null;
};

const DEFINITIONS: {
  key: ChallengeKey;
  title: string;
  description: string;
  target: number;
  unit: string;
  read: (input: ChallengeInput) => number;
}[] = [
  {
    key: "wear-three",
    title: "Wear three outfits this week",
    description: "Record three different days with a saved outfit.",
    target: 3,
    unit: "wears",
    read: (input) => input.wearsThisWeek,
  },
  {
    key: "fresh-outfit",
    title: "Save a new combination",
    description: "Build one outfit you have not saved before this week.",
    target: 1,
    unit: "outfits",
    read: (input) => input.outfitsThisWeek,
  },
  {
    key: "build-capsule",
    title: "Build a capsule",
    description: "Group ten or fewer pieces into a capsule for a season.",
    target: 1,
    unit: "capsules",
    read: (input) => input.capsules,
  },
];

export function evaluateChallenges(
  input: ChallengeInput,
  completed: Map<string, string> = new Map(),
): Challenge[] {
  return DEFINITIONS.map((definition) => {
    const progress = Math.max(0, Math.min(definition.read(input), 99));
    const completedOn = completed.get(definition.key) ?? null;

    return {
      key: definition.key,
      title: definition.title,
      description: definition.description,
      target: definition.target,
      progress,
      unit: definition.unit,
      complete: Boolean(completedOn) || progress >= definition.target,
      completedOn,
    };
  });
}
