import { prisma } from "@/lib/db";
import {
  TEMPLATE_KEYS,
  TEMPLATE_LABELS,
  type TemplateKey,
} from "@/lib/email-templates";
import { getSiteUrl } from "@/lib/seo";
import { getBankDetails } from "@/lib/shop-config";
import { formatMoney } from "@/lib/pricing";
import { logOrderEvent } from "@/lib/order-events";

export { TEMPLATE_KEYS, TEMPLATE_LABELS, type TemplateKey };

const DEFAULTS: Record<TemplateKey, { subject: string; body: string }> = {
  design_approved: {
    subject: "Макетът за поръчка {{orderId}} е одобрен",
    body: "Здравейте, {{name}},\n\nМакетът към поръчка {{orderId}} е одобрен и влиза в производство.\n\n{{note}}\n\nПреглед: {{orderUrl}}",
  },
  design_rejected: {
    subject: "Нужна е корекция по макета · поръчка {{orderId}}",
    body: "Здравейте, {{name}},\n\nЗа поръчка {{orderId}} е нужна корекция на макета:\n\n{{note}}\n\nМоля изпратете коригиран файл, като отговорите на този имейл.\n\nПреглед: {{orderUrl}}",
  },
  shipped: {
    subject: "Поръчка {{orderId}} е предадена към куриера",
    body: "Здравейте, {{name}},\n\nПоръчка {{orderId}} е предадена за доставка.\nПроследяване: {{trackingUrl}}\n\nПреглед: {{orderUrl}}",
  },
  payment_reminder: {
    subject: "Напомняне за плащане · поръчка {{orderId}}",
    body: "Здравейте, {{name}},\n\nПоръчка {{orderId}} на стойност {{total}} все още чака банков превод.\n\n{{bankDetails}}\nОснование: {{orderId}}\n\nПреглед: {{orderUrl}}",
  },
};

export async function ensureMessageTemplates() {
  const existing = await prisma.messageTemplate.findMany();
  const byKey = new Map(existing.map((row) => [row.key, row]));
  for (const key of TEMPLATE_KEYS) {
    if (!byKey.has(key)) {
      const row = await prisma.messageTemplate.create({
        data: { key, ...DEFAULTS[key] },
      });
      byKey.set(key, row);
    }
  }
  return TEMPLATE_KEYS.map((key) => byKey.get(key)!);
}

export function renderTemplate(
  text: string,
  vars: Record<string, string>,
) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, name: string) => vars[name] ?? "");
}

export async function sendCustomerMessage(input: {
  orderId: string;
  key: TemplateKey;
  note?: string;
  actorEmail?: string | null;
}) {
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new Error("Поръчката не е намерена");

  await ensureMessageTemplates();
  const template = await prisma.messageTemplate.findUnique({
    where: { key: input.key },
  });
  if (!template) throw new Error("Липсва шаблон");

  const bank = getBankDetails();
  const vars = {
    name: order.customerName,
    orderId: order.id,
    note: input.note?.trim() || order.designReviewNote || "",
    orderUrl: `${getSiteUrl()}/order/${order.id}/success?t=${order.publicToken}`,
    trackingUrl:
      order.trackingUrl ||
      (order.econtShipmentNumber
        ? `https://www.econt.com/tracking/${order.econtShipmentNumber}`
        : "ще получите номер за проследяване"),
    total: formatMoney(Number(order.totalAmount)),
    bankDetails: `${bank.beneficiary}\nIBAN: ${bank.iban}\nBIC: ${bank.bic}`,
  };

  const subject = renderTemplate(template.subject, vars);
  const body = renderTemplate(template.body, vars);
  const html = `<pre style="font-family:Georgia,serif;white-space:pre-wrap;font-size:16px;line-height:1.5">${body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</pre>`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { skipped: true as const, subject, body };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const from =
    process.env.EMAIL_FROM ?? "Studio Breza <onboarding@resend.dev>";
  const sent = await resend.emails.send({
    from,
    to: order.customerEmail,
    subject,
    html,
    text: body,
  });
  if (sent.error) throw new Error(sent.error.message);

  await logOrderEvent({
    orderId: order.id,
    type: "email",
    message: `Имейл „${TEMPLATE_LABELS[input.key]}“ към ${order.customerEmail}`,
    actorEmail: input.actorEmail,
    payload: { key: input.key, subject },
  });

  return { skipped: false as const, subject, body };
}
