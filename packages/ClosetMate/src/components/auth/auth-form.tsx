"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import {
  signInWithDevEmail,
  signInWithGoogle,
  type AuthState,
} from "@/lib/actions/auth";

export function AuthForm({
  googleEnabled,
  devEnabled,
  mode,
}: {
  googleEnabled: boolean;
  devEnabled: boolean;
  mode: "login" | "register";
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInWithDevEmail,
    {},
  );

  return (
    <div className="space-y-6">
      {googleEnabled ? (
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" size="lg" className="w-full">
            <svg viewBox="0 0 24 24" aria-hidden className="size-4">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
              />
            </svg>
            Continue with Google
          </Button>
        </form>
      ) : null}

      {googleEnabled && devEnabled ? (
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>
      ) : null}

      {devEnabled ? (
        <form action={formAction} className="space-y-3">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          {state.error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            {mode === "register" ? "Create account" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-muted">
            Local development sign-in. No password, no email is sent.
          </p>
        </form>
      ) : null}

      <div className="text-center text-sm">
        <Link
          href="/api/guest?next=/app/today"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Continue as a guest instead
        </Link>
      </div>
    </div>
  );
}
