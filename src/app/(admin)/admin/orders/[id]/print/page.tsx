import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { materialsFromOrderItems } from "@/lib/order-materials";
import { shortOrderId } from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ProductionCardPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { uploadedDesign: true, adminDesign: true, product: true },
      },
    },
  });
  if (!order) notFound();
  const materials = materialsFromOrderItems(order.items);

  return (
    <div className="print-sheet">
      <p className="no-print">
        <Link href={`/admin/orders/${order.id}`}>← Назад</Link>
      </p>
      <PrintButton />
      <h1>Производствена карта #{shortOrderId(order.id)}</h1>
      <p>
        {order.customerName} · {order.customerPhone}
        {order.rush ? " · УСКОРЕНА" : ""}
      </p>
      <p>{order.shippingAddress}</p>
      {materials.length ? (
        <p>
          Материали:{" "}
          {materials
            .map((row) => `${row.label} (${row.sheets} плочи)`)
            .join(" · ")}
        </p>
      ) : null}
      {order.items.map((item) => {
        const p = item.personalization as Record<string, unknown>;
        const file = item.adminDesign ?? item.uploadedDesign;
        return (
          <section key={item.id} className="print-item">
            <h2>{item.title}</h2>
            <p>Брой: {item.quantity}</p>
            {p.widthCm ? (
              <p>
                {String(p.widthCm)}×{String(p.heightCm)} см ·{" "}
                {String(p.thicknessMm)} мм
              </p>
            ) : null}
            {p.engravingText ? <p>Текст: {String(p.engravingText)}</p> : null}
            {file ? <p>Файл: {file.originalName}</p> : <p>Няма файл</p>}
          </section>
        );
      })}
    </div>
  );
}
