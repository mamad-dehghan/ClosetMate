"use client";

export type PreparedImage = {
  blob: Blob;
  preview: string;
  color: string | null;
  width: number;
  height: number;
};

const MAX_EDGE = 1600;
const QUALITY = 0.82;

function toHex(r: number, g: number, b: number) {
  const part = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${part(r)}${part(g)}${part(b)}`;
}

function saturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

/**
 * Picks the colour a person would call the garment's colour: the most
 * frequent saturated bucket, ignoring near-white background pixels.
 */
function extractDominantColor(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    return null;
  }

  const buckets = new Map<
    string,
    { count: number; weight: number; r: number; g: number; b: number }
  >();
  let fallback = { r: 0, g: 0, b: 0, count: 0 };

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const alpha = data[i + 3] ?? 255;
    if (alpha < 128) continue;

    fallback.r += r;
    fallback.g += g;
    fallback.b += b;
    fallback.count += 1;

    const isBackground = r > 238 && g > 238 && b > 238;
    if (isBackground) continue;

    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bucket = buckets.get(key) ?? { count: 0, weight: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.weight += 1 + saturation(r, g, b) * 2;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  let best: { r: number; g: number; b: number; weight: number } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.weight > best.weight) {
      best = {
        r: bucket.r / bucket.count,
        g: bucket.g / bucket.count,
        b: bucket.b / bucket.count,
        weight: bucket.weight,
      };
    }
  }

  if (best) return toHex(best.r, best.g, best.b);
  if (fallback.count > 0) {
    return toHex(
      fallback.r / fallback.count,
      fallback.g / fallback.count,
      fallback.b / fallback.count,
    );
  }
  return null;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read this image");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("Could not process image")),
      "image/webp",
      QUALITY,
    );
  });

  const color = extractDominantColor(canvas, width, height);

  return {
    blob,
    preview: URL.createObjectURL(blob),
    color,
    width,
    height,
  };
}

export async function uploadPreparedImage(blob: Blob) {
  const body = new FormData();
  body.append("file", blob, "item.webp");

  const response = await fetch("/api/upload", { method: "POST", body });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error ?? "Upload failed");
  }

  return (await response.json()) as { url: string; key: string };
}
