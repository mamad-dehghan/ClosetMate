import type { Item, Outfit } from "@/db/schema";
import { OUTFIT_ORDER, OCCASIONS } from "./categories";
import { harmonyForColors } from "./color";

export type OutfitWithPieces = Outfit & { pieces: Item[] };

export function sortPiecesByCategory<T extends { category: string }>(pieces: T[]) {
  return [...pieces].sort((a, b) => {
    const left = OUTFIT_ORDER.indexOf(a.category as never);
    const right = OUTFIT_ORDER.indexOf(b.category as never);
    return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
  });
}

export function outfitHarmony(pieces: { primaryColor: string | null }[]) {
  return harmonyForColors(pieces.map((piece) => piece.primaryColor));
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function isoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Local (not UTC) date, so "today" matches the user's calendar. */
export function todayISO(now = new Date()) {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function currentMonth(now = new Date()) {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export type CalendarCell = {
  iso: string | null;
  day: number | null;
};

/**
 * Six-week grid, Monday first, so the calendar height never jumps between
 * months. Days outside the month are null.
 */
export function monthGrid(
  year: number,
  month: number,
  today = todayISO(),
): CalendarCell[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leading = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: CalendarCell[] = [];

  for (let index = 0; index < leading; index += 1) {
    cells.push({ iso: null, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = isoDate(year, month, day);
    cells.push({ iso, day });
  }

  while (cells.length < 42) cells.push({ iso: null, day: null });

  // `today` is accepted for symmetry/testing; cells stay plain data.
  void today;
  return cells;
}

export function formatDayLabel(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** ISO date N days before `now`, in local time. */
export function daysAgoISO(days: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return isoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function formatShortDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function defaultOutfitName(name: string, occasion?: string | null) {
  if (name.trim()) return name.trim();
  const label = OCCASIONS.find((entry) => entry.value === occasion)?.label;
  return label ? `${label} outfit` : "Untitled outfit";
}

export function outfitCover<
  T extends { imageUrl: string | null; name: string; category: string },
>(pieces: T[], limit = 4) {
  return sortPiecesByCategory(pieces).slice(0, limit);
}
