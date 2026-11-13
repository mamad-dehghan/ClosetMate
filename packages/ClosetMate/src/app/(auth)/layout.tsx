import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-5 sm:px-6">
        <Brand />
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        {children}
      </main>
      <p className="pb-6 text-center text-xs text-muted">
        Wardrobes are private by default.{" "}
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
