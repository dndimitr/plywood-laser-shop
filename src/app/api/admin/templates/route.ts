import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import {
  TEMPLATE_KEYS,
  ensureMessageTemplates,
} from "@/lib/customer-emails";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const templates = await ensureMessageTemplates();
  return NextResponse.json(templates);
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    key?: string;
    subject?: string;
    body?: string;
  };
  if (!body.key || !TEMPLATE_KEYS.includes(body.key as never)) {
    return NextResponse.json({ error: "Невалиден шаблон" }, { status: 400 });
  }
  const row = await prisma.messageTemplate.upsert({
    where: { key: body.key },
    update: {
      subject: body.subject ?? "",
      body: body.body ?? "",
    },
    create: {
      key: body.key,
      subject: body.subject ?? "",
      body: body.body ?? "",
    },
  });
  return NextResponse.json(row);
}
