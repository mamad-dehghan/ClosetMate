import { NextResponse } from "next/server";
import { requireActor } from "@/lib/actor";
import { putImage } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = ["image/webp", "image/png", "image/jpeg"];

export async function POST(request: Request) {
  try {
    await requireActor();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Use a WebP, PNG or JPEG image" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is larger than 12MB" },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const stored = await putImage(bytes, file.type === "image/png" ? "image/png" : "image/webp");

  return NextResponse.json(stored);
}
