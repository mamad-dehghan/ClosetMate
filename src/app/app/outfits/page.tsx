import Link from "next/link";
import { CalendarDays, Layers, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Outfits" };

export default function OutfitsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl">Outfits</h1>
        <p className="mt-1 text-sm text-muted">
          Saved combinations, wear history and the weekly calendar.
        </p>
      </header>

      <section className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
          <Layers className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl">The studio is next</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          The database already stores outfits, outfit items, wear history and
          calendar plans. The builder UI is the next release, so nothing you add
          now will be lost.
        </p>
        <Link
          href="/app/wardrobe"
          className={`${buttonVariants({ variant: "outline", size: "md" })} mt-6`}
        >
          <Plus className="size-4" />
          Keep building your wardrobe
        </Link>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          Coming in the next release
        </h2>
        <ul className="mt-3 space-y-2">
          {[
            {
              icon: Layers,
              title: "Outfit studio",
              body: "Pick pieces side by side, save the combination, add tags.",
            },
            {
              icon: CalendarDays,
              title: "Wear history + calendar",
              body: "Assign an outfit to a date and mark it as worn.",
            },
            {
              icon: Sparkles,
              title: "Remix and gap detector",
              body: "Swap one piece in a saved outfit, or spot missing basics.",
            },
          ].map((entry) => (
            <li
              key={entry.title}
              className="flex items-start gap-3 rounded-card border border-line bg-surface px-4 py-3.5"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                <entry.icon className="size-4" />
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  {entry.title}
                  <Badge tone="outline">Next</Badge>
                </p>
                <p className="mt-0.5 text-sm text-muted">{entry.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
