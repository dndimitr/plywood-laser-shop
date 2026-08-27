import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { logOrderEvent } from "@/lib/order-events";

type Params = { params: Promise<{ id: string }> };

const ALLOWED = new Set([
  "image/svg+xml",
  "image/png",
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "application/dxf",
  "image/vnd.dxf",
  "application/octet-stream",
]);

export async function POST(request: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const form = await request.formData();
  const file = form.get("file");
  const itemId = String(form.get("itemId") ?? "");
  if (!(file instanceof File) || !itemId) {
    return NextResponse.json({ error: "Липсват файл или артикул" }, { status: 400 });
  }
  const name = file.name.toLowerCase();
  const okType =
    ALLOWED.has(file.type) ||
    name.endsWith(".svg") ||
    name.endsWith(".dxf") ||
    name.endsWith(".pdf") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg");
  if (!okType) {
    return NextResponse.json(
      { error: "Позволени: SVG, DXF, PNG, PDF, JPG" },
      { status: 400 },
    );
  }

  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, orderId: id },
  });
  if (!item) {
    return NextResponse.json({ error: "Артикулът не е в тази поръчка" }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  let url: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`admin-designs/${randomUUID()}-${safeName}`, bytes, {
      access: "public",
      contentType: file.type || "application/octet-stream",
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
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    },
  });
  await prisma.orderItem.update({
    where: { id: item.id },
    data: { adminDesignId: design.id },
  });
  await logOrderEvent({
    orderId: id,
    type: "file",
    message: `Качен производствен файл: ${file.name}`,
    actorEmail: session.user.email,
  });
  return NextResponse.json(design);
}
