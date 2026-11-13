"use server";

import { signIn, signOut } from "@/lib/auth";

export type AuthState = { error?: string };

function isRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/app/today" });
}

export async function signInWithDevEmail(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
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
