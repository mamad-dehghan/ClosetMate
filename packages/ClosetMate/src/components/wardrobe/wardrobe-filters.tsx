"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/field";
import { CATEGORIES, SEASONS, OCCASIONS } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Counts = Record<string, number>;

export function WardrobeFilters({
  counts,
  total,
}: {
  counts: Counts;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const initial = useRef(true);

  function commit(next: URLSearchParams) {
    const search = next.toString();
    router.push(`/app/wardrobe${search ? `?${search}` : ""}`, {
      scroll: false,
    });
  }

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    commit(next);
  }

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (query) next.set("q", query);
      else next.delete("q");
      commit(next);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const activeCategory = params.get("category") ?? "";
  const hasFilters = ["q", "category", "season", "occasion", "favorite", "worn"].some(
    (key) => params.get(key),
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, brand or note"
          className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-10 text-[15px] placeholder:text-muted/70 focus:border-accent/60 focus:outline-none focus:ring-4 focus:ring-accent/10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => update("category", "")}
          className={cn(
            "shrink-0 rounded-pill border px-3.5 py-2 text-sm transition-colors",
            !activeCategory
              ? "border-ink bg-ink text-canvas"
              : "border-line bg-surface text-muted hover:text-ink",
          )}
        >
          All
          <span className="ml-1.5 text-xs opacity-70">{total}</span>
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => update("category", category.value)}
            className={cn(
              "shrink-0 rounded-pill border px-3.5 py-2 text-sm transition-colors",
              activeCategory === category.value
                ? "border-ink bg-ink text-canvas"
                : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            {category.label}
            <span className="ml-1.5 text-xs opacity-70">
              {counts[category.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <SlidersHorizontal className="size-3.5" />
          Filters
        </div>
        <Select
          aria-label="Season"
          value={params.get("season") ?? ""}
          onChange={(event) => update("season", event.target.value)}
          className="h-9 w-auto min-w-32 rounded-pill px-3 text-xs"
        >
          <option value="">Any season</option>
          {SEASONS.map((season) => (
            <option key={season.value} value={season.value}>
              {season.label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Occasion"
          value={params.get("occasion") ?? ""}
          onChange={(event) => update("occasion", event.target.value)}
          className="h-9 w-auto min-w-32 rounded-pill px-3 text-xs"
        >
          <option value="">Any occasion</option>
          {OCCASIONS.map((occasion) => (
            <option key={occasion.value} value={occasion.value}>
              {occasion.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() =>
            update("favorite", params.get("favorite") === "1" ? "" : "1")
          }
          className={cn(
            "min-h-9 rounded-pill border px-3.5 text-xs transition-colors",
            params.get("favorite") === "1"
              ? "border-accent/40 bg-accent-soft text-accent-hover"
              : "border-line bg-surface text-muted hover:text-ink",
          )}
        >
          Favourites
        </button>
        <button
          type="button"
          onClick={() =>
            update("worn", params.get("worn") === "stale" ? "" : "stale")
          }
          className={cn(
            "min-h-9 rounded-pill border px-3.5 text-xs transition-colors",
            params.get("worn") === "stale"
              ? "border-sage/40 bg-sage-soft text-sage"
              : "border-line bg-surface text-muted hover:text-ink",
          )}
        >
          Not worn in 30 days
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.push("/app/wardrobe")}
            className="min-h-9 rounded-pill px-3 text-xs text-accent underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
}
