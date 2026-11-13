import { cn } from "@/lib/utils";

export function Brand({
  className,
  compact = false,
  href = "/",
}: {
  className?: string;
  compact?: boolean;
  href?: string;
}) {
  return (
    <a href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="inline-flex size-9 items-center justify-center rounded-[11px] bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.svg" alt="" className="size-9 rounded-[11px]" />
      </span>
      {!compact ? (
        <span className="font-display text-[19px] leading-none tracking-tight">
          ClosetMate
        </span>
      ) : null}
    </a>
  );
}
