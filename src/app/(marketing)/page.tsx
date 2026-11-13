import Link from "next/link";
import {
  ArrowRight,
  Palette,
  Shirt,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GarmentImage } from "@/components/wardrobe/garment-image";
import { SAMPLE_ITEMS } from "@/lib/sample-wardrobe";

const HERO_PIECES = ["/sample/coat.svg", "/sample/shirt.svg", "/sample/jeans.svg", "/sample/sneakers.svg"];

const STEPS = [
  {
    title: "Add a few pieces",
    body: "A photo and a category is enough. Everything else — season, occasion, price — is optional and can wait.",
    icon: Shirt,
  },
  {
    title: "See what pairs well",
    body: "Colour harmony and versatility scores show which pieces work together, without any AI guesswork.",
    icon: Palette,
  },
  {
    title: "Plan the week",
    body: "Build outfits once, then reuse them. Calendar and wear history land in the next release.",
    icon: TrendingUp,
  },
];

const FEATURES = [
  {
    title: "A wardrobe that stays searchable",
    body: "Filter by category, colour, season and occasion. Every item keeps one photo and the details that matter.",
    tag: "Available now",
    tone: "sage" as const,
  },
  {
    title: "Colour harmony, explained",
    body: "Each pairing is scored with colour theory — monochrome, analogous, complementary — so you learn why it works.",
    tag: "Available now",
    tone: "accent" as const,
  },
  {
    title: "Versatility score",
    body: "See how many complete outfits a single piece unlocks. It is the fastest way to spot the heroes you never wear.",
    tag: "Available now",
    tone: "sage" as const,
  },
  {
    title: "Outfit studio",
    body: "Build outfits from what you own, save them, and reuse them. Ships in the next release.",
    tag: "Next release",
    tone: "outline" as const,
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-accent-soft blur-3xl sm:size-[28rem]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-72 size-56 rounded-full bg-sage-soft blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="relative">
            <Badge tone="accent" className="mb-5">
              <Sparkles className="size-3.5" />
              Personal wardrobe · everyday outfits
            </Badge>
            <h1 className="font-display text-[2.6rem] leading-[1.05] text-balance sm:text-6xl lg:text-[4.15rem]">
              Better outfits from the clothes you{" "}
              <span className="italic text-accent">already own</span>.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
              ClosetMate is a personal wardrobe organizer and outfit assistant.
              Catalog what you have, see which pieces work together, and stop
              deciding what to wear from scratch every morning.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/demo"
                className={buttonVariants({ size: "lg", variant: "primary" })}
              >
                Try the demo closet
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Create a free account
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              No full closet required.{" "}
              <span className="text-ink">Five items is enough</span> to see the
              value.
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {HERO_PIECES.map((src, index) => (
                <GarmentImage
                  key={src}
                  src={src}
                  alt=""
                  priority={index < 2}
                  className={
                    index % 2 === 0 ? "mt-0" : "mt-6 sm:mt-10"
                  }
                  imgClassName="object-contain p-2"
                />
              ))}
            </div>
            <div className="absolute -bottom-4 left-1/2 w-[88%] -translate-x-1/2 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-card backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                This morning
              </p>
              <p className="mt-1 text-sm font-medium">
                Camel coat + oxford shirt + straight jeans
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-line/70 bg-surface/60">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            ["2 minutes", "to add your first five pieces"],
            ["No shopping", "suggestions built from your wardrobe"],
            ["Private", "wardrobes are yours by default"],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="font-display text-2xl">{title}</p>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl text-balance sm:text-4xl">
            Start with what is already in the drawer.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-card border border-line bg-surface p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-2 text-ink">
                  <step.icon className="size-5" />
                </span>
                <span className="font-display text-3xl text-line">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-line/70 bg-surface/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                What you get
              </p>
              <h2 className="mt-3 font-display text-3xl text-balance sm:text-4xl">
                Useful on day one, not after a hundred uploads.
              </h2>
            </div>
            <Link
              href="/demo"
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              Look inside the sample closet
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-card border border-line bg-canvas p-6"
              >
                <Badge tone={feature.tone}>{feature.tag}</Badge>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample strip */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Sample closet
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Twelve pieces. Dozens of outfits.
            </h2>
          </div>
        </div>
        <div className="mt-8 -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {SAMPLE_ITEMS.slice(0, 6).map((item) => (
            <div key={item.name} className="w-40 shrink-0 snap-start sm:w-auto">
              <GarmentImage
                src={item.imageUrl}
                alt={item.name}
                imgClassName="object-contain p-2"
              />
              <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs capitalize text-muted">
                {item.category}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-12 text-canvas sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/25 blur-3xl"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-canvas/60">
            Ready when you are
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl text-balance sm:text-5xl">
            Your wardrobe already has more outfits than you think.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/demo"
              className={buttonVariants({ size: "lg", variant: "accent" })}
            >
              Open the demo closet
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center rounded-pill border border-canvas/25 px-7 text-base text-canvas transition-colors hover:bg-canvas/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
