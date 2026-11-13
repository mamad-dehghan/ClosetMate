import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { GuestClaim } from "@/components/auth/guest-claim";
import { AppShell } from "@/components/layout/app-shell";
import { getActor } from "@/lib/actor";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const actor = await getActor();

  if (!actor) {
    redirect("/api/guest?next=/app/today");
  }

  const session = await auth();
  const user = await db.query.users.findFirst({
    where: eq(users.id, actor.userId),
    columns: { name: true, email: true },
  });

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    (actor.isGuest ? "Guest closet" : "You");

  return (
    <>
      <GuestClaim />
      <AppShell isGuest={actor.isGuest} displayName={displayName}>
        {children}
      </AppShell>
    </>
  );
}
