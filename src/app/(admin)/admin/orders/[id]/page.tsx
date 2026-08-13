import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderStatusForm } from "@/components/OrderStatusForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import {
  complexityLabel,
  laserTypeLabel,
  paymentMethodLabel,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { uploadedDesign: true, product: true },
      },
    },
  });

  if (!order) notFound();

  return (
    <div className="admin-panel">
      <p>
        <Link href="/admin/orders">← Поръчки</Link>
      </p>
      <h1>Поръчка {order.id}</h1>
      <div className="admin-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <div className="admin-card">
          <h3>Клиент</h3>
          <p>{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>{order.customerPhone}</p>
          <p>{order.shippingAddress}</p>
          {order.shippingNote ? <p>Бележка: {order.shippingNote}</p> : null}
          <p>
            Плащане:{" "}
            {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}
          </p>
          <p>Общо: {formatBgn(Number(order.totalAmount))}</p>
          {"companyName" in order && order.companyName ? (
            <p>
              Фактура: {String(order.companyName)} / {String(order.vatNumber)}
            </p>
          ) : null}
        </div>
        <OrderStatusForm
          orderId={order.id}
          currentStatus={order.status}
          currentDesignReview={
            "designReview" in order
              ? String(order.designReview)
              : "NOT_REQUIRED"
          }
          currentPaymentStatus={
            "paymentStatus" in order ? String(order.paymentStatus) : "PENDING"
          }
          currentAdminNotes={
            "adminNotes" in order ? (order.adminNotes as string | null) : ""
          }
        />
      </div>

      <h2 style={{ marginTop: "2rem" }}>Артикули</h2>
      <div className="admin-grid">
        {order.items.map((item) => {
          const personalization = item.personalization as Record<
            string,
            string | number | undefined
          >;
          return (
            <div key={item.id} className="admin-card">
              <h3>{item.title}</h3>
              <p>
                {item.quantity} × {formatBgn(Number(item.unitPrice))}
              </p>
              {personalization.engravingText ? (
                <p>Текст: {personalization.engravingText}</p>
              ) : null}
              {personalization.optionLabel ? (
                <p>{String(personalization.optionLabel)}</p>
              ) : null}
              {personalization.laserType ? (
                <p>
                  {laserTypeLabel[String(personalization.laserType)] ??
                    personalization.laserType}
                </p>
              ) : null}
              {personalization.widthCm ? (
                <p>
                  {personalization.widthCm}×{personalization.heightCm} см ·{" "}
                  {personalization.thicknessMm} мм ·{" "}
                  {complexityLabel[String(personalization.complexity)] ??
                    personalization.complexity}
                </p>
              ) : null}
              {item.uploadedDesign ? (
                <p>
                  Файл:{" "}
                  <a href={item.uploadedDesign.url} target="_blank" rel="noreferrer">
                    {item.uploadedDesign.originalName}
                  </a>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
