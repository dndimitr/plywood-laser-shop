import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminFilePreview } from "@/components/AdminFilePreview";
import { OrderStatusForm } from "@/components/OrderStatusForm";
import { ResendOrderEmailButton } from "@/components/ResendOrderEmailButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import {
  complexityLabel,
  courierLabel,
  designReviewLabel,
  laserTypeLabel,
  paymentMethodLabel,
  paymentStatusLabel,
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

  const attachedFiles = order.items.filter((i) => i.uploadedDesign);

  return (
    <div className="admin-panel">
      <p>
        <Link href="/admin/orders">← Поръчки</Link>
      </p>
      <h1>
        Поръчка {order.id}
        {order.rush ? <span className="badge-rush"> · Ускорена</span> : null}
      </h1>
      <div className="admin-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <div className="admin-card">
          <h3>Клиент</h3>
          <p>{order.customerName}</p>
          <p>
            <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
          </p>
          <p>
            <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
          </p>
          <p>{order.shippingAddress}</p>
          {order.shippingNote ? <p>Бележка: {order.shippingNote}</p> : null}
          <p>
            Куриер: {courierLabel[order.courier] ?? order.courier} ·{" "}
            {formatBgn(Number(order.shippingFee))}
          </p>
          <p>
            Плащане:{" "}
            {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod} ·{" "}
            {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
          </p>
          <p>
            Междинна: {formatBgn(Number(order.subtotalAmount))} · Общо:{" "}
            <strong>{formatBgn(Number(order.totalAmount))}</strong>
          </p>
          <p>
            Макет:{" "}
            {designReviewLabel[order.designReview] ?? order.designReview}
          </p>
          {order.companyName ? (
            <p>
              Фактура: {order.companyName}
              {order.vatNumber ? ` / ${order.vatNumber}` : ""}
            </p>
          ) : null}
          <p className="muted">
            Публичен линк:{" "}
            <Link
              href={`/order/${order.id}/success?t=${order.publicToken}`}
              target="_blank"
            >
              преглед за клиента
            </Link>
          </p>
        </div>
        <div className="admin-grid">
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentDesignReview={order.designReview}
            currentPaymentStatus={order.paymentStatus}
            currentAdminNotes={order.adminNotes}
          />
          <ResendOrderEmailButton orderId={order.id} />
        </div>
      </div>

      {attachedFiles.length > 0 ? (
        <>
          <h2 style={{ marginTop: "2rem" }}>Прикачени файлове</h2>
          <div className="admin-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {attachedFiles.map((item) =>
              item.uploadedDesign ? (
                <div key={item.id} className="admin-card">
                  <h3>{item.title}</h3>
                  <AdminFilePreview
                    url={item.uploadedDesign.url}
                    originalName={item.uploadedDesign.originalName}
                    mimeType={item.uploadedDesign.mimeType}
                  />
                </div>
              ) : null,
            )}
          </div>
        </>
      ) : null}

      <h2 style={{ marginTop: "2rem" }}>Артикули</h2>
      <div className="admin-grid">
        {order.items.map((item) => {
          const personalization = item.personalization as Record<
            string,
            string | number | boolean | undefined
          >;
          return (
            <div key={item.id} className="admin-card">
              <h3>{item.title}</h3>
              <p>
                {item.quantity} × {formatBgn(Number(item.unitPrice))} ={" "}
                {formatBgn(Number(item.unitPrice) * item.quantity)}
              </p>
              {personalization.engravingText ? (
                <p>Текст: {String(personalization.engravingText)}</p>
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
                    String(personalization.complexity)}
                </p>
              ) : null}
              {item.uploadedDesign ? (
                <p className="muted">
                  Файл: {item.uploadedDesign.originalName} (виж секцията горе)
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
