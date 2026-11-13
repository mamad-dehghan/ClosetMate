import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-ink text-canvas hover:bg-ink-soft",
        accent: "bg-accent text-white hover:bg-accent-hover",
        outline:
          "border border-line bg-surface text-ink hover:border-ink/25 hover:bg-surface-2",
        ghost: "text-ink hover:bg-surface-2",
        soft: "bg-accent-soft text-accent-hover hover:bg-accent-soft/70",
        danger: "bg-red-50 text-red-700 hover:bg-red-100",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
