import { Brand } from "@/components/brand/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-canvas">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Brand />
          <p className="max-w-xs text-sm text-muted">
            Better outfits from the clothes you already own.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <a className="hover:text-ink" href="/demo">
            Sample closet
          </a>
          <a className="hover:text-ink" href="/login">
            Sign in
          </a>
          <span className="text-muted/70">
            Wardrobes are private by default.
          </span>
        </div>
      </div>
    </footer>
  );
}
