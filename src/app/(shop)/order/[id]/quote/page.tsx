import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import { courierLabel, paymentMethodLabelFor } from "@/lib/labels";
import { getBankDetails } from "@/lib/shop-config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function QuotePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { t } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order || !t || order.publicToken !== t) notFound();

  const bank = getBankDetails();
  const items = order.items ?? [];

  return (
    <div className="container" style={{ padding: "2rem 0", maxWidth: 720 }}>
      <style>{`@media print { .no-print { display:none !important } body { background:#fff } }`}</style>
      <div className="no-print cta-row" style={{ marginBottom: "1rem" }}>
        <a className="btn btn-primary" href="javascript:window.print()">
          Печат / PDF
        </a>
      </div>
      <h1 className="page-title">Оферта / поръчка {order.id}</h1>
      <p>
        {order.customerName}
        {order.companyName ? ` · ${order.companyName}` : ""}
        {order.vatNumber ? ` · ЕИК ${order.vatNumber}` : ""}
      </p>
      <p className="muted">{order.shippingAddress}</p>
      <p>
        Куриер: {courierLabel[order.courier] ?? order.courier} · Плащане:{" "}
        {paymentMethodLabelFor(order.paymentMethod, order.courier)}
      </p>
      <table className="admin-table" style={{ marginTop: "1.5rem" }}>
        <thead>
          <tr>
            <th>Артикул</th>
            <th>Бр.</th>
            <th>Ед. цена</th>
            <th>Сума</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.quantity}</td>
              <td>{formatBgn(Number(item.unitPrice))}</td>
              <td>{formatBgn(Number(item.unitPrice) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "1rem" }}>
        Междинна: {formatBgn(Number(order.subtotalAmount ?? 0))} · Доставка:{" "}
        {formatBgn(Number(order.shippingFee ?? 0))} ·{" "}
        <strong>Общо: {formatBgn(Number(order.totalAmount))}</strong>
      </p>
      {order.paymentMethod === "CASH_ON_DELIVERY" ? (
        <p className="muted">
          Наложен платеж при доставка — плащане на куриера при получаване.
        </p>
      ) : null}
      {order.paymentMethod === "BANK_TRANSFER" ? (
        <p className="muted">
          IBAN {bank.iban} · Основание: {bank.reasonPrefix} {order.id}
        </p>
      ) : null}
    </div>
  );
}
