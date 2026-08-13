import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

const ALLOWED = new Set([
  "image/svg+xml",
  "image/png",
  "application/pdf",
  "image/jpeg",
  "image/jpg",
]);

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Липсва файл" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Позволени формати: SVG, PNG, PDF, JPG" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Файлът е по-голям от 8 MB" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`designs/${randomUUID()}-${safeName}`, bytes, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    url = blob.url;
  } else {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}-${safeName}`;
    await writeFile(path.join(dir, filename), bytes);
    url = `/uploads/${filename}`;
  }

  const design = await prisma.uploadedDesign.create({
    data: {
      url,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  return NextResponse.json(design);
}
