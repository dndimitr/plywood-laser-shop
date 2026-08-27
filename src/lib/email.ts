import { courierLabel, paymentMethodLabel } from "@/lib/labels";
import { getBankDetails } from "@/lib/shop-config";
import { formatBgn } from "@/lib/pricing";
import { getSiteUrl } from "@/lib/seo";

export type OrderMailItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  fileName?: string | null;
  fileUrl?: string | null;
};

export type OrderMail = {
  id: string;
  publicToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  totalAmount: number;
  shippingFee?: number;
  paymentMethod: string;
  courier?: string;
  rush?: boolean;
  items?: OrderMailItem[];
};

function appUrl() {
  return getSiteUrl();
}

function itemsHtml(items: OrderMailItem[] | undefined) {
  if (!items?.length) return "";
  const rows = items
    .map((item) => {
      const file = item.fileUrl
        ? `<br/><a href="${item.fileUrl}">Файл: ${item.fileName ?? "прикачен файл"}</a>`
        : "";
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd">${item.title}${file}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd">${formatBgn(item.unitPrice * item.quantity)}</td>
      </tr>`;
    })
    .join("");
  return `
    <h3>Артикули</h3>
    <table style="border-collapse:collapse;width:100%;max-width:560px">
      <thead>
        <tr>
          <th align="left" style="padding:6px 8px;border-bottom:2px solid #333">Продукт</th>
          <th align="left" style="padding:6px 8px;border-bottom:2px solid #333">Бр.</th>
          <th align="left" style="padding:6px 8px;border-bottom:2px solid #333">Сума</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export async function sendOrderEmails(order: OrderMail) {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Studio Breza <onboarding@resend.dev>";
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL;
  const successUrl = `${appUrl()}/order/${order.id}/success?t=${order.publicToken}`;
  const adminUrl = `${appUrl()}/admin/orders/${order.id}`;
  const bank = getBankDetails();

  const shippingLine =
    order.courier != null
      ? `<p>Доставка: ${courierLabel[order.courier] ?? order.courier}${
          order.shippingFee != null
            ? ` · ${formatBgn(order.shippingFee)}`
            : ""
        }</p>`
      : "";

  const customerHtml = `
    <h2>Поръчката ви е приета</h2>
    <p>Здравейте, ${order.customerName},</p>
    <p>Номер: <strong>${order.id}</strong></p>
    <p>Сума: <strong>${formatBgn(order.totalAmount)}</strong></p>
    ${order.rush ? "<p><strong>Ускорена поръчка</strong></p>" : ""}
    ${shippingLine}
    ${order.shippingAddress ? `<p>Адрес: ${order.shippingAddress}</p>` : ""}
    ${itemsHtml(order.items)}
    <p><a href="${successUrl}">Преглед на поръчката</a></p>
    ${
      order.paymentMethod === "BANK_TRANSFER"
        ? `<p>Банков превод:<br/>${bank.beneficiary}<br/>IBAN: ${bank.iban}<br/>BIC: ${bank.bic}<br/>Основание: ${bank.reasonPrefix} ${order.id}</p>`
        : `<p>Плащане: ${paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}</p>`
    }
    <p>При въпроси отговорете на този имейл или се обадете.</p>
  `;

  const adminHtml = `
    <h2>Нова поръчка</h2>
    <p><strong>${order.customerName}</strong></p>
    <p>${order.customerEmail}${order.customerPhone ? ` · ${order.customerPhone}` : ""}</p>
    <p>Сума: <strong>${formatBgn(order.totalAmount)}</strong></p>
    <p>Плащане: ${paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}</p>
    ${shippingLine}
    ${order.shippingAddress ? `<p>Адрес: ${order.shippingAddress}</p>` : ""}
    ${order.rush ? "<p><strong>Ускорена</strong></p>" : ""}
    ${itemsHtml(order.items)}
    <p><a href="${adminUrl}">Отвори в админ</a></p>
  `;

  if (!key) {
    console.info("[email] RESEND_API_KEY missing — skipped", order.id);
    return { skipped: true as const };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const replyTo =
    adminTo && !adminTo.endsWith("@plywood.local") ? adminTo : undefined;

  const customer = await resend.emails.send({
    from,
    to: order.customerEmail,
    replyTo,
    subject: `Поръчка ${order.id} · Studio Breza`,
    html: customerHtml,
  });
  if (customer.error) {
    console.error("[email] customer send failed", customer.error);
    throw new Error(customer.error.message);
  }

  if (adminTo && !adminTo.endsWith("@plywood.local")) {
    const admin = await resend.emails.send({
      from,
      to: adminTo,
      subject: `Нова поръчка ${order.id}${order.rush ? " · ускорена" : ""}`,
      html: adminHtml,
    });
    if (admin.error) {
      console.error("[email] admin send failed", admin.error);
      throw new Error(admin.error.message);
    }
  } else {
    console.warn("[email] ADMIN_NOTIFY_EMAIL missing — admin copy skipped");
  }

  return { skipped: false as const };
}
