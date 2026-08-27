import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminCustomerMessage } from "@/components/AdminCustomerMessage";
import { AdminFilePreview } from "@/components/AdminFilePreview";
import { AdminItemFileUpload } from "@/components/AdminItemFileUpload";
import { AdminOrderEditForm } from "@/components/AdminOrderEditForm";
import { EcontWaybillButton } from "@/components/EcontWaybillButton";
import { OrderStatusForm } from "@/components/OrderStatusForm";
import { ResendOrderEmailButton } from "@/components/ResendOrderEmailButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isEcontConfigured } from "@/lib/econt";
import { materialsFromOrderItems } from "@/lib/order-materials";
import { formatMoney } from "@/lib/pricing";
import { getShippingFees } from "@/lib/shop-settings";
import { parseOrderShippingDetails } from "@/lib/shipping-details";
import {
  complexityLabel,
  courierLabel,
  customerFlagLabel,
  designReviewLabel,
  laserTypeLabel,
  machineStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  shortOrderId,
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
        include: { uploadedDesign: true, adminDesign: true, product: true },
      },
      events: { orderBy: { createdAt: "desc" }, take: 40 },
    },
  });

  if (!order) notFound();

  const profile = await prisma.customerProfile.findUnique({
    where: { email: order.customerEmail.toLowerCase() },
  });
  const previous = await prisma.order.findMany({
    where: {
      id: { not: order.id },
      OR: [
        { customerEmail: order.customerEmail },
        { customerPhone: order.customerPhone },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const attachedFiles = order.items.filter(
    (item) => item.uploadedDesign || item.adminDesign,
  );
  const materials = materialsFromOrderItems(order.items);
  const fees = getShippingFees();
  const shippingDetails = parseOrderShippingDetails(order.shippingDetails);

  return (
    <div className="admin-panel">
      <p>
        <Link href="/admin/orders">← Поръчки</Link>
        {" · "}
        <Link href={`/admin/orders/${order.id}/print`}>Производствена карта</Link>
        {" · "}
        <Link href={`/admin/orders/${order.id}/invoice`}>Проформа</Link>
      </p>
      <div className="admin-page-head">
        <h1>
          Поръчка #{shortOrderId(order.id)}
          {order.rush ? <span className="badge-rush"> · Ускорена</span> : null}
        </h1>
      </div>
      {profile && profile.flag !== "NONE" ? (
        <p className="admin-warn">
          Клиент: {customerFlagLabel[profile.flag] ?? profile.flag}
          {profile.note ? ` — ${profile.note}` : ""}
        </p>
      ) : null}

      <div className="admin-grid admin-order-layout">
        <div className="admin-card">
          <h3>Преглед</h3>
          <p>
            {order.customerName}
            <br />
            <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
            <br />
            <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
          </p>
          <p>{order.shippingAddress}</p>
          <p>
            {courierLabel[order.courier]} · {formatMoney(Number(order.shippingFee))}
          </p>
          <p>
            {paymentMethodLabel[order.paymentMethod]} ·{" "}
            {paymentStatusLabel[order.paymentStatus]}
          </p>
          <p>
            Макет: {designReviewLabel[order.designReview]} · Машина:{" "}
            {machineStatusLabel[order.machineStatus]}
          </p>
          <p>
            Общо: <strong>{formatMoney(Number(order.totalAmount))}</strong>
          </p>
          {order.trackingUrl ? (
            <p>
              <a href={order.trackingUrl} target="_blank" rel="noreferrer">
                Проследяване
              </a>
            </p>
          ) : null}
          <p className="muted">
            <Link
              href={`/order/${order.id}/success?t=${order.publicToken}`}
              target="_blank"
            >
              Преглед за клиента
            </Link>
          </p>
          {previous.length ? (
            <div>
              <h4>Предишни поръчки</h4>
              <ul>
                {previous.map((row) => (
                  <li key={row.id}>
                    <Link href={`/admin/orders/${row.id}`}>
                      #{shortOrderId(row.id)} · {formatMoney(Number(row.totalAmount))}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="admin-grid">
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentDesignReview={order.designReview}
            currentPaymentStatus={order.paymentStatus}
            currentMachineStatus={order.machineStatus}
            currentAdminNotes={order.adminNotes}
            currentDesignNote={order.designReviewNote}
            paidAt={order.paidAt?.toISOString() ?? null}
            paymentMethod={order.paymentMethod}
          />
          <AdminCustomerMessage orderId={order.id} />
          <ResendOrderEmailButton orderId={order.id} />
          {order.courier === "ECONT" ? (
            <EcontWaybillButton
              orderId={order.id}
              configured={isEcontConfigured()}
              shipmentNumber={order.econtShipmentNumber}
              pdfUrl={order.econtPdfUrl}
              trackingUrl={order.trackingUrl}
            />
          ) : null}
        </div>
      </div>

      <AdminOrderEditForm
        orderId={order.id}
        hasWaybill={Boolean(order.econtShipmentNumber)}
        defaultFees={fees}
        initial={{
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          shippingNote: order.shippingNote ?? "",
          courier: order.courier,
          shippingFee: Number(order.shippingFee),
          paymentMethod: order.paymentMethod,
          rush: order.rush,
          needInvoice: order.needInvoice,
          companyName: order.companyName ?? "",
          vatNumber: order.vatNumber ?? "",
          speedyShipmentNumber: order.speedyShipmentNumber ?? "",
          trackingUrl: order.trackingUrl ?? "",
          shippingDetails,
          items: order.items.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            sheetCount: item.sheetCount,
          })),
        }}
      />

      {materials.length ? (
        <div className="admin-card">
          <h3>Материали</h3>
          <ul>
            {materials.map((row) => (
              <li key={row.label}>
                {row.label}: {row.pieces} бр. · {row.sheets} плочи
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {attachedFiles.length > 0 ? (
        <>
          <h2>Файлове</h2>
          <div className="admin-grid admin-two">
            {attachedFiles.map((item) => (
              <div key={item.id} className="admin-card">
                <h3>{item.title}</h3>
                {item.uploadedDesign ? (
                  <AdminFilePreview
                    url={item.uploadedDesign.url}
                    originalName={`Клиент: ${item.uploadedDesign.originalName}`}
                    mimeType={item.uploadedDesign.mimeType}
                  />
                ) : null}
                {item.adminDesign ? (
                  <AdminFilePreview
                    url={item.adminDesign.url}
                    originalName={`Производство: ${item.adminDesign.originalName}`}
                    mimeType={item.adminDesign.mimeType}
                  />
                ) : null}
                <AdminItemFileUpload
                  orderId={order.id}
                  itemId={item.id}
                  title={item.title}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="admin-card">
          <h3>Производствени файлове</h3>
          {order.items.map((item) => (
            <AdminItemFileUpload
              key={item.id}
              orderId={order.id}
              itemId={item.id}
              title={item.title}
            />
          ))}
        </div>
      )}

      <h2>Артикули</h2>
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
                {item.quantity} × {formatMoney(Number(item.unitPrice))} ={" "}
                {formatMoney(Number(item.unitPrice) * item.quantity)}
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
            </div>
          );
        })}
      </div>

      <div className="admin-card">
        <h3>История</h3>
        {order.events.length === 0 ? (
          <p className="muted">Все още няма записани промени.</p>
        ) : (
          <ul className="admin-timeline">
            {order.events.map((event) => (
              <li key={event.id}>
                <strong>
                  {event.createdAt.toLocaleString("bg-BG", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </strong>
                {" — "}
                {event.message}
                {event.actorEmail ? (
                  <span className="muted"> · {event.actorEmail}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
