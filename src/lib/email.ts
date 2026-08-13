import { getBankDetails } from "@/lib/shop-config";
import { formatBgn } from "@/lib/pricing";

type OrderMail = {
  id: string;
  publicToken: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  rush?: boolean;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendOrderEmails(order: OrderMail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "ЛазерШперплат <onboarding@resend.dev>";
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL;
  const successUrl = `${appUrl()}/order/${order.id}/success?t=${order.publicToken}`;
  const bank = getBankDetails();

  const customerHtml = `
    <h2>Поръчката ви е приета</h2>
    <p>Здравейте, ${order.customerName},</p>
    <p>Номер: <strong>${order.id}</strong></p>
    <p>Сума: <strong>${formatBgn(order.totalAmount)}</strong></p>
    <p><a href="${successUrl}">Преглед на поръчката</a></p>
    ${
      order.paymentMethod === "BANK_TRANSFER"
        ? `<p>Банков превод:<br/>${bank.beneficiary}<br/>IBAN: ${bank.iban}<br/>BIC: ${bank.bic}<br/>Основание: ${bank.reasonPrefix} ${order.id}</p>`
        : ""
    }
  `;

  if (!key) {
    console.info("[email] RESEND_API_KEY missing — skipped", order.id);
    return { skipped: true as const };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to: order.customerEmail,
    subject: `Поръчка ${order.id} · ЛазерШперплат`,
    html: customerHtml,
  });

  if (adminTo) {
    await resend.emails.send({
      from,
      to: adminTo,
      subject: `Нова поръчка ${order.id}`,
      html: `<h2>Нова поръчка</h2><p>${order.customerName} · ${order.customerEmail}</p><p>${formatBgn(order.totalAmount)}</p>`,
    });
  }

  return { skipped: false as const };
}
