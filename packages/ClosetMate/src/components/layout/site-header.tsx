import Link from "next/link";
import { Brand } from "@/components/brand/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a className="transition-colors hover:text-ink" href="#how">
            How it works
          </a>
          <a className="transition-colors hover:text-ink" href="#features">
            Features
          </a>
          <Link className="transition-colors hover:text-ink" href="/demo">
            Sample closet
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Sign in
          </Link>
          <Link href="/demo" className={buttonVariants({ size: "sm" })}>
            Try the demo
          </Link>
        </div>
      </div>
    </header>
  );
}
