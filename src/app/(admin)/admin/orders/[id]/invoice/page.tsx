import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBankDetails, getShopAddress, getShopPhone } from "@/lib/shop-config";
import { formatMoney } from "@/lib/pricing";
import { shortOrderId } from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function InvoicePage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();
  const bank = getBankDetails();

  return (
    <div className="print-sheet">
      <p className="no-print">
        <Link href={`/admin/orders/${order.id}`}>← Назад</Link>
      </p>
      <PrintButton />
      <h1>Проформа #{shortOrderId(order.id)}</h1>
      <p>
        Studio Breza
        <br />
        {getShopAddress()}
        <br />
        {getShopPhone()}
      </p>
      <p>
        Клиент: {order.customerName}
        <br />
        {order.customerEmail} · {order.customerPhone}
        {order.companyName ? (
          <>
            <br />
            {order.companyName}
            {order.vatNumber ? ` / ${order.vatNumber}` : ""}
          </>
        ) : null}
      </p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Артикул</th>
            <th>Бр.</th>
            <th>Сума</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.quantity}</td>
              <td>{formatMoney(Number(item.unitPrice) * item.quantity)}</td>
            </tr>
          ))}
          <tr>
            <td>Доставка</td>
            <td></td>
            <td>{formatMoney(Number(order.shippingFee))}</td>
          </tr>
          <tr>
            <td>
              <strong>Общо</strong>
            </td>
            <td></td>
            <td>
              <strong>{formatMoney(Number(order.totalAmount))}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Банков превод:
        <br />
        {bank.beneficiary}
        <br />
        IBAN {bank.iban} · BIC {bank.bic}
        <br />
        Основание: {bank.reasonPrefix} {order.id}
      </p>
    </div>
  );
}
