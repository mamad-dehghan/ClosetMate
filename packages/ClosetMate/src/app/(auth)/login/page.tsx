import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const devEnabled =
    process.env.ALLOW_DEV_LOGIN === "1" || process.env.NODE_ENV !== "production";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-3xl">Sign in to your closet</h1>
        <p className="mt-2 text-sm text-muted">
          Your wardrobe moves with you across devices.
        </p>
        <div className="mt-6">
          <AuthForm
            googleEnabled={googleEnabled}
            devEnabled={devEnabled}
            mode="login"
          />
        </div>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
