import { cn } from "@/lib/utils";

export function GarmentImage({
  src,
  alt,
  className,
  imgClassName,
  ratio = "aspect-[4/5]",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] bg-surface-2",
        ratio,
        className,
      )}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn("size-full object-cover", imgClassName)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-xs text-muted">
          No photo
        </div>
      )}
    </div>
  );
}
