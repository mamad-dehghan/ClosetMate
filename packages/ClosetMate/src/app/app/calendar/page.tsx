import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Plus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { listOutfits, planForDate, plansBetween } from "@/db/queries/outfits";
import { requireActor } from "@/lib/actor";
import { planOutfitAction, removePlanAction } from "@/lib/actions/outfits";
import { OCCASIONS } from "@/lib/categories";
import {
  currentMonth,
  formatDayLabel,
  isoDate,
  monthGrid,
  monthLabel,
  shiftMonth,
  todayISO,
} from "@/lib/outfits";
import { cn } from "@/lib/utils";

export const metadata = { title: "Calendar" };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireActor();
  const raw = await searchParams;
  const fallback = currentMonth();

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(
    typeof raw.month === "string" ? raw.month : "",
  );
  const parsedYear = monthMatch ? Number(monthMatch[1]) : fallback.year;
  const parsedMonth = monthMatch ? Number(monthMatch[2]) : fallback.month;
  const valid =
    Number.isFinite(parsedYear) &&
    parsedYear >= 2000 &&
    parsedYear <= 2100 &&
    Number.isFinite(parsedMonth) &&
    parsedMonth >= 1 &&
    parsedMonth <= 12;

  const year = valid ? parsedYear : fallback.year;
  const month = valid ? parsedMonth : fallback.month;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  const grid = monthGrid(year, month);
  const days = grid.filter((cell) => cell.iso !== null);
  const firstISO = days[0]?.iso ?? isoDate(year, month, 1);
  const lastISO = days[days.length - 1]?.iso ?? firstISO;
  const today = todayISO();

  const dateParam =
    typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
      ? raw.date
      : null;
  const selectedDate =
    dateParam ?? (today.startsWith(monthKey) ? today : firstISO);

  const [plans, outfits, selectedPlan] = await Promise.all([
    plansBetween(actor.userId, firstISO, lastISO),
    listOutfits(actor.userId),
    planForDate(actor.userId, selectedDate),
  ]);

  const planMap = new Map(plans.map((plan) => [plan.plannedFor, plan]));
  const previous = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const plannedDays = new Set(plans.map((plan) => plan.plannedFor)).size;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Calendar</h1>
          <p className="mt-1 text-sm text-muted">
            {plannedDays === 0
              ? "No days planned this month yet."
              : `${plannedDays} day${plannedDays === 1 ? "" : "s"} planned this month`}
          </p>
        </div>
        <Link
          href="/app/outfits/studio"
          className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}
        >
          <Plus className="size-4" />
          New outfit
        </Link>
      </header>

      {/* Month navigation */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/app/calendar?month=${previous.year}-${String(previous.month).padStart(2, "0")}`}
          aria-label="Previous month"
          className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="text-center">
          <p className="font-display text-xl">{monthLabel(year, month)}</p>
          {!today.startsWith(monthKey) ? (
            <Link
              href="/app/calendar"
              className="text-xs text-accent underline-offset-4 hover:underline"
            >
              Back to today
            </Link>
          ) : null}
        </div>
        <Link
          href={`/app/calendar?month=${next.year}-${String(next.month).padStart(2, "0")}`}
          aria-label="Next month"
          className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-ink"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="rounded-card border border-line bg-surface p-2 shadow-card sm:p-3">
        <div className="grid grid-cols-7 gap-1 pb-1">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-center text-[10px] font-medium uppercase tracking-[0.08em] text-muted"
            >
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, index) => {
            if (!cell.iso || !cell.day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const plan = planMap.get(cell.iso);
            const isToday = cell.iso === today;
            const isSelected = cell.iso === selectedDate;
            const firstPiece = plan?.pieces[0];

            return (
              <Link
                key={cell.iso}
                href={`/app/calendar?month=${monthKey}&date=${cell.iso}`}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border text-sm transition-colors",
                  isSelected
                    ? "border-ink bg-ink text-canvas"
                    : "border-transparent hover:border-line hover:bg-surface-2/60",
                  isToday && !isSelected && "border-accent/50",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-canvas" : "text-ink",
                  )}
                >
                  {cell.day}
                </span>
                {plan ? (
                  firstPiece?.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={firstPiece.imageUrl}
                      alt=""
                      className="size-6 rounded-full border border-canvas object-cover"
                    />
                  ) : (
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isSelected ? "bg-canvas" : "bg-accent",
                      )}
                    />
                  )
                ) : (
                  <span className="size-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Day panel */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">{formatDayLabel(selectedDate)}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {selectedDate === today ? "Today" : selectedDate}
            </p>
          </div>
          {selectedDate === today ? <Badge tone="sage">Today</Badge> : null}
        </div>

        {selectedPlan ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-2.5">
            <GarmentImage
              src={selectedPlan.pieces[0]?.imageUrl ?? null}
              alt={selectedPlan.outfit.name}
              ratio="aspect-square"
              className="w-16 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {selectedPlan.outfit.name}
              </p>
              <p className="text-xs text-muted">
                {selectedPlan.pieces.length} piece
                {selectedPlan.pieces.length === 1 ? "" : "s"}
                {selectedPlan.occasion
                  ? ` · ${OCCASIONS.find((entry) => entry.value === selectedPlan.occasion)?.label ?? selectedPlan.occasion}`
                  : ""}
              </p>
              <Link
                href={`/app/outfits/${selectedPlan.outfit.id}`}
                className="mt-1 inline-block text-xs font-medium text-accent hover:underline"
              >
                Open outfit
              </Link>
            </div>
            <form action={removePlanAction}>
              <input type="hidden" name="planId" value={selectedPlan.id} />
              <button
                type="submit"
                aria-label="Remove plan"
                className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </form>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Nothing planned for this day.
          </p>
        )}

        {outfits.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-surface-2/70 px-4 py-4 text-center">
            <p className="text-sm text-muted">
              Save an outfit first, then plan it here.
            </p>
            <Link
              href="/app/outfits/studio"
              className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3`}
            >
              <Plus className="size-4" />
              Create an outfit
            </Link>
          </div>
        ) : (
          <form action={planOutfitAction} className="mt-4 space-y-3">
            <input type="hidden" name="plannedFor" value={selectedDate} />
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <select
                  name="outfitId"
                  defaultValue={selectedPlan?.outfit.id ?? outfits[0]?.id ?? ""}
                  className="h-11 w-full appearance-none rounded-xl border border-line bg-canvas pl-9 pr-3 text-sm"
                >
                  {outfits.map((outfit) => (
                    <option key={outfit.id} value={outfit.id}>
                      {outfit.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className={buttonVariants({ size: "sm" })}
              >
                {selectedPlan ? "Replace" : "Plan"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
