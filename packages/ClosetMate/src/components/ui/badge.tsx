import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-line bg-surface-2 text-ink-soft",
  accent: "border-accent/25 bg-accent-soft text-accent-hover",
  sage: "border-sage/25 bg-sage-soft text-sage",
  outline: "border-line bg-transparent text-muted",
  warning: "border-amber-300/50 bg-amber-50 text-amber-800",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
