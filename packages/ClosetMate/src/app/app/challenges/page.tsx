import Link from "next/link";
import { Check, Flame, Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  capsuleCount,
  completionsByKey,
  outfitsCreatedBetween,
  wearsBetween,
} from "@/db/queries/challenges";
import { requireActor } from "@/lib/actor";
import { completeChallengeAction } from "@/lib/actions/challenges";
import { evaluateChallenges } from "@/lib/challenges";
import { formatShortDate, weekBounds } from "@/lib/outfits";

export const metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const actor = await requireActor();
  const { from, to } = weekBounds();

  const [wearsThisWeek, outfitsThisWeek, capsules, completions] =
    await Promise.all([
      wearsBetween(actor.userId, from, to),
      outfitsCreatedBetween(actor.userId, from, to),
      capsuleCount(actor.userId),
      completionsByKey(actor.userId),
    ]);

  const challenges = evaluateChallenges(
    { wearsThisWeek, outfitsThisWeek, capsules },
    completions,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 font-display text-3xl sm:text-4xl">
          <Flame className="size-6 text-accent" />
          Challenges
        </h1>
        <p className="mt-1 text-sm text-muted">
          Small prompts that make the wardrobe feel less like an archive. Week
          of {formatShortDate(from)} – {formatShortDate(to)}.
        </p>
      </header>

      <ul className="space-y-3">
        {challenges.map((challenge) => {
          const pct = Math.min(
            100,
            Math.round((challenge.progress / challenge.target) * 100),
          );

          return (
            <li
              key={challenge.key}
              className="rounded-card border border-line bg-surface p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {challenge.title}
                    {challenge.complete ? (
                      <Badge tone="sage">
                        <Check className="size-3" />
                        {challenge.completedOn
                          ? formatShortDate(challenge.completedOn)
                          : "Done"}
                      </Badge>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {challenge.description}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-muted">
                  {challenge.progress}/{challenge.target} {challenge.unit}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  {challenge.complete
                    ? "Target reached."
                    : pct === 0
                      ? "Not started."
                      : "In progress."}
                </p>
                {challenge.complete && !challenge.completedOn ? (
                  <form action={completeChallengeAction}>
                    <input type="hidden" name="key" value={challenge.key} />
                    <button
                      type="submit"
                      className={buttonVariants({ size: "sm" })}
                    >
                      Save completion
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/outfits/studio"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Plus className="size-4" />
          Build an outfit
        </Link>
        <Link
          href="/app/capsules/new"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Package className="size-4" />
          Start a capsule
        </Link>
      </div>
    </div>
  );
}
