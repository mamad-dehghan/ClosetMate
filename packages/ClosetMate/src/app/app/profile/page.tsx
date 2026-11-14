import Link from "next/link";
import { Download, LogOut, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  DeleteAccountForm,
  PreferencesForm,
} from "@/components/profile/preferences-form";
import { LocationCard } from "@/components/profile/location-card";
import { db } from "@/db/client";
import { countItems } from "@/db/queries/items";
import { eq } from "drizzle-orm";
import { preferences, users } from "@/db/schema";
import { requireActor } from "@/lib/actor";
import { auth, signOut } from "@/lib/auth";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const actor = await requireActor();
  const session = await auth();

  const [user, prefs, { total }] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, actor.userId) }),
    db.query.preferences.findFirst({
      where: eq(preferences.userId, actor.userId),
    }),
    countItems(actor.userId),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          {total} piece{total === 1 ? "" : "s"} in this wardrobe.
        </p>
      </header>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-ink">
            <User className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-medium">
              {user?.name?.trim() || "Guest"}
            </p>
            <p className="truncate text-sm text-muted">
              {user?.email ?? "No email — this is an anonymous closet"}
            </p>
          </div>
          {actor.isGuest ? (
            <Badge tone="accent" className="ml-auto">
              Guest
            </Badge>
          ) : (
            <Badge tone="sage" className="ml-auto">
              Signed in
            </Badge>
          )}
        </div>

        {actor.isGuest ? (
          <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3">
            <p className="text-sm text-accent-hover">
              Create an account to keep this wardrobe across devices.
            </p>
            <Link
              href="/register"
              className={`${buttonVariants({ variant: "accent", size: "sm" })} mt-3`}
            >
              Save my closet
            </Link>
          </div>
        ) : null}
      </section>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold">Preferences</h2>
        <p className="mt-1 text-sm text-muted">
          Used for prices and future weather-aware suggestions.
        </p>
        <div className="mt-4">
          <PreferencesForm
            currency={prefs?.currency ?? "USD"}
            units={prefs?.units ?? "metric"}
            theme={prefs?.theme ?? "system"}
          />
        </div>
      </section>

      <LocationCard
        label={prefs?.locationLabel ?? null}
        latitude={prefs?.latitude ?? null}
        longitude={prefs?.longitude ?? null}
      />

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold">Wardrobe insights</h2>
        <p className="mt-1 text-sm text-muted">
          Coverage, gaps, cost per wear and the pieces you never reach for.
        </p>
        <Link
          href="/app/insights"
          className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}
        >
          Open insights
        </Link>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-sage" />
          Your data
        </h2>
        <p className="mt-1 text-sm text-muted">
          Wardrobes are private. Nothing is public and nothing is shared with
          other users.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="/api/export"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download className="size-4" />
            Export as JSON
          </a>
          {session?.user?.id ? (
            <form action={signOutRedirect}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="rounded-card border border-red-200/60 bg-red-50/40 p-5">
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-red-800/70">
          Deleting removes the wardrobe, its items and any outfits permanently.
        </p>
        <div className="mt-4">
          <DeleteAccountForm />
        </div>
      </section>
    </div>
  );
}

async function signOutRedirect() {
  "use server";
  await signOut({ redirectTo: "/" });
}
