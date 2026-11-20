"use server";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { signIn, signOut } from "@/lib/auth";
import {
  isValidEmail,
  isValidPassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth-utils";
import {
  GUEST_COOKIE,
  claimGuestWardrobe,
  isGuestUser,
  verifyGuestToken,
} from "@/lib/guest";
import { hashPassword } from "@/lib/password";
import { ensurePreferences, seedWardrobe } from "@/lib/seed";

export type AuthState = { error?: string };

function isRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function claimCurrentGuest(userId: string) {
  const store = await cookies();
  const guestId = verifyGuestToken(store.get(GUEST_COOKIE)?.value);
  if (!guestId) return false;

  if (!(await isGuestUser(guestId))) {
    store.delete(GUEST_COOKIE);
    return false;
  }

  await claimGuestWardrobe(guestId, userId);
  store.delete(GUEST_COOKIE);
  return true;
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/app/today" });
}

export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email) || password.length === 0) {
    return { error: "Enter your email and password." };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return { error: "Incorrect email or password." };
  }

  try {
    await signIn("password", { email, password, redirectTo: "/app/today" });
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: "Incorrect email or password." };
  }
}

export async function registerWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const includeSamples = formData.get("samples") === "on";

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!isValidPassword(password)) {
    return {
      error: `Use a password between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
    };
  }

  if (password !== confirmPassword) {
    return { error: "Those passwords do not match." };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });

  if (existing) {
    return { error: "An account with that email already exists. Sign in instead." };
  }

  const passwordHash = await hashPassword(password);
  let createdId: string | undefined;

  try {
    const [created] = await db
      .insert(users)
      .values({
        email,
        name: name || email.split("@")[0] || "Friend",
        passwordHash,
      })
      .returning({ id: users.id });
    createdId = created?.id;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { error: "An account with that email already exists. Sign in instead." };
    }
    console.error("[closetmate] could not create account", error);
    return { error: "Could not create your account. Try again." };
  }

  if (!createdId) {
    return { error: "Could not create your account. Try again." };
  }

  await ensurePreferences(createdId);

  // If this browser has a guest closet, move it onto the new account before
  // the first render. That avoids a flash of an empty wardrobe, and the guest
  // pieces replace the sample seed.
  let claimedGuest = false;
  try {
    claimedGuest = await claimCurrentGuest(createdId);
  } catch (error) {
    console.error("[closetmate] could not claim guest wardrobe", error);
  }

  if (includeSamples && !claimedGuest) {
    try {
      await seedWardrobe(createdId);
    } catch (error) {
      // The account exists; the empty wardrobe can offer the samples again.
      console.error("[closetmate] could not seed sample wardrobe", error);
    }
  }

  try {
    await signIn("password", { email, password, redirectTo: "/app/today" });
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error("[closetmate] account created but sign-in failed", error);
    return { error: "Your account was created. Sign in to continue." };
  }
}

export async function signInWithDevEmail(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  try {
    await signIn("dev", { email, redirectTo: "/app/today" });
    return {};
  } catch (error) {
    if (isRedirect(error)) throw error;
    return { error: "Could not sign in with that address." };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
