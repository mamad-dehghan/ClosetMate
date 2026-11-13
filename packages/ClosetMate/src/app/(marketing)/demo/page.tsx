import Link from "next/link";
import { ArrowRight, Camera, Palette, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { SAMPLE_ITEMS } from "@/lib/sample-wardrobe";

export const metadata = {
  title: "Sample closet",
  description:
    "Explore a twelve-piece sample wardrobe and see how ClosetMate scores colours and versatility.",
};

export default function DemoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <Badge tone="accent">
          <Sparkles className="size-3.5" />
          Sample wardrobe
        </Badge>
        <h1 className="mt-5 font-display text-4xl text-balance sm:text-5xl">
          Twelve pieces you can actually combine.
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          This is the closet every new account starts with. Open it as a guest
          to rename, recolor, delete, or add your own clothes — no registration
          required.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/api/guest?next=/app/today"
            className={buttonVariants({ size: "lg", variant: "primary" })}
          >
            Open my demo closet
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Sign in instead
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted">
          Guest closets are kept in this browser session and move into your
          account when you sign up.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {SAMPLE_ITEMS.map((item) => (
          <figure
            key={item.name}
            className="rounded-card border border-line bg-surface p-2.5 shadow-card"
          >
            <GarmentImage
              src={item.imageUrl}
              alt={item.name}
              imgClassName="object-contain p-1"
            />
            <figcaption className="px-1 pb-1 pt-3">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs capitalize text-muted">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full border border-line"
                  style={{ backgroundColor: item.primaryColor }}
                />
                {item.category}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Palette,
            title: "Colour harmony",
            body: "Every piece is scored against the rest of the closet using the colour wheel.",
          },
          {
            icon: Camera,
            title: "Quick add",
            body: "Drop in a photo and ClosetMate guesses the dominant colour for you.",
          },
          {
            icon: Sparkles,
            title: "No setup form",
            body: "Season, occasion, price and notes are optional. Add them when you feel like it.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-card border border-line bg-surface p-5"
          >
            <card.icon className="size-5 text-accent" />
            <h2 className="mt-3 font-semibold">{card.title}</h2>
            <p className="mt-1.5 text-sm text-muted">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
