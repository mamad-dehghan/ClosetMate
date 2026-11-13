"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Plus, Shirt, Sun, User } from "lucide-react";
import { Brand } from "@/components/brand/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/today", label: "Today", icon: Sun },
  { href: "/app/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/app/outfits", label: "Outfits", icon: Layers },
  { href: "/app/profile", label: "Profile", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  isGuest,
  displayName,
}: {
  children: React.ReactNode;
  isGuest: boolean;
  displayName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh md:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-canvas px-4 py-6 md:flex">
        <div className="px-2">
          <Brand />
        </div>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                isActive(pathname, item.href)
                  ? "bg-surface text-ink shadow-card"
                  : "text-muted hover:bg-surface/60 hover:text-ink",
              )}
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <Link
            href="/app/wardrobe/new"
            className={cn(
              buttonVariants({ variant: "primary", size: "md" }),
              "w-full",
            )}
          >
            <Plus className="size-4" />
            Add clothing
          </Link>
          <div className="rounded-2xl border border-line bg-surface/70 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">
              {isGuest ? "Guest closet" : "Signed in"}
            </p>
            <p className="mt-1 truncate text-sm font-medium">{displayName}</p>
            {isGuest ? (
              <Link
                href="/register"
                className="mt-2 inline-block text-xs font-medium text-accent underline-offset-4 hover:underline"
              >
                Save this closet
              </Link>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            href="/app/profile"
            className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-xs font-semibold uppercase text-ink"
          >
            {displayName.slice(0, 1)}
          </Link>
        </div>
        {isGuest ? (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-accent-soft px-3 py-2 text-xs text-accent-hover">
            <span>You are exploring as a guest.</span>
            <Link href="/register" className="font-semibold underline">
              Save
            </Link>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 md:pb-16 md:pt-10">
        {children}
      </main>

      {/* Mobile add button */}
      <Link
        href="/app/wardrobe/new"
        aria-label="Add clothing"
        className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-ink text-canvas shadow-lift transition-transform active:scale-95 md:hidden"
      >
        <Plus className="size-6" />
      </Link>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur safe-bottom md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                  active ? "text-ink" : "text-muted",
                )}
              >
                <item.icon
                  className={cn("size-5", active && "text-accent")}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
