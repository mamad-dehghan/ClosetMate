import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in" };

const ERROR_COPY: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password.",
  OAuthAccountNotLinked:
    "That email is already linked to another sign-in method. Use the method you signed up with.",
  AccessDenied: "You do not have access to that account.",
  Verification: "That link is no longer valid. Request a new one.",
  Configuration: "Sign-in is not configured correctly. Try again later.",
};

function errorMessage(error: string | string[] | undefined) {
  const code = Array.isArray(error) ? error[0] : error;
  if (!code) return null;
  return ERROR_COPY[code] ?? "Something went wrong signing you in. Try again.";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const devEnabled =
    process.env.ALLOW_DEV_LOGIN === "1" || process.env.NODE_ENV !== "production";
  const { error } = await searchParams;
  const message = errorMessage(error);

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
        {message ? (
          <p
            className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {message}
          </p>
        ) : null}
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
