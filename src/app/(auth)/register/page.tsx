import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const devEnabled =
    process.env.ALLOW_DEV_LOGIN === "1" || process.env.NODE_ENV !== "production";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Start small
        </p>
        <h1 className="mt-2 font-display text-3xl">Create your closet</h1>
        <p className="mt-2 text-sm text-muted">
          No questionnaire. You will start with twelve sample pieces and can
          replace them at your own pace.
        </p>
        <div className="mt-6">
          <AuthForm
            googleEnabled={googleEnabled}
            devEnabled={devEnabled}
            mode="register"
          />
        </div>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        Already have a closet?{" "}
        <Link
          href="/login"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
