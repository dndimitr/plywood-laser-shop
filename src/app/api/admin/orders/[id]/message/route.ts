import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import {
  TEMPLATE_KEYS,
  sendCustomerMessage,
  type TemplateKey,
} from "@/lib/customer-emails";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await request.json()) as { key?: string; note?: string };
  if (!body.key || !TEMPLATE_KEYS.includes(body.key as TemplateKey)) {
    return NextResponse.json({ error: "Невалиден шаблон" }, { status: 400 });
  }
  try {
    const result = await sendCustomerMessage({
      orderId: id,
      key: body.key as TemplateKey,
      note: body.note,
      actorEmail: session.user.email,
    });
    if (result.skipped) {
      return NextResponse.json(
        {
          error:
            "Имейлите не са конфигурирани. Добавете RESEND_API_KEY в средата.",
          subject: result.subject,
          body: result.body,
        },
        { status: 503 },
      );
    }
    if (body.key === "payment_reminder") {
      await prisma.order.update({
        where: { id },
        data: { reminderSentAt: new Date() },
      });
    }
    return NextResponse.json({ ok: true, subject: result.subject });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Грешка" },
      { status: 500 },
    );
  }
}
