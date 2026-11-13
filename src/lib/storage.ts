import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");

export type StoredImage = { url: string; key: string };

function driver() {
  return process.env.STORAGE_DRIVER === "blob" ? "blob" : "local";
}

function safeName(key: string) {
  return path.basename(key).replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function putImage(
  bytes: Uint8Array,
  contentType: string,
): Promise<StoredImage> {
  const ext = contentType === "image/png" ? "png" : "webp";
  const key = `${crypto.randomUUID()}.${ext}`;

  if (driver() === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, Buffer.from(bytes), {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return { url: blob.url, key: blob.pathname ?? key };
  }

  const dir = LOCAL_DIR;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), bytes);
  return { url: `/api/files/${key}`, key };
}

export async function readLocalImage(key: string) {
  const filename = safeName(key);
  if (!filename) return null;
  try {
    return await readFile(path.join(LOCAL_DIR, filename));
  } catch {
    return null;
  }
}

export async function removeImage(url: string | null | undefined) {
  if (!url) return;
  if (url.startsWith("/api/files/")) {
    const filename = safeName(url.replace("/api/files/", ""));
    await unlink(path.join(LOCAL_DIR, filename)).catch(() => undefined);
    return;
  }
  if (driver() === "blob" && url.startsWith("http")) {
    const { del } = await import("@vercel/blob");
    await del(url).catch(() => undefined);
  }
}
