import Link from "next/link";
import { notFound } from "next/navigation";
import { IconCheck } from "@/components/Icons";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import {
  courierLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/lib/labels";
import { getBankDetails } from "@/lib/shop-config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
};

type CutDownload = {
  slug: string;
  title: string;
  href: string;
};

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { t } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  const tokenOk =
    typeof t === "string" &&
    t.length > 0 &&
    "publicToken" in order &&
    order.publicToken === t;

  if (!tokenOk) {
    return (
      <div className="container success-page">
        <h1 className="page-title">Нужен е линк за достъп</h1>
        <p className="muted">
          За защита на личните данни отворете линка от имейла за потвърждение
          или се свържете с нас с номера на поръчката.
        </p>
        <p>
          Номер на поръчка: <strong>{order.id}</strong>
        </p>
        <Link href="/" className="btn btn-primary">
          Към началото
        </Link>
      </div>
    );
  }

  const bank = getBankDetails();
  const items = (
    order as {
      items?: Array<{
        title: string;
        product?: { slug?: string; cutFileUrl?: string | null; name?: string } | null;
      }>;
    }
  ).items;

  const cutDownloads: CutDownload[] = [];
  const seen = new Set<string>();
  for (const item of items ?? []) {
    const slug = item.product?.slug;
    const cut = item.product?.cutFileUrl;
    if (!slug || !cut || seen.has(slug)) continue;
    seen.add(slug);
    cutDownloads.push({
      slug,
      title: item.product?.name ?? item.title,
      href: `/api/orders/${id}/cut-files/${encodeURIComponent(slug)}?t=${encodeURIComponent(t!)}`,
    });
  }

  return (
    <div className="container success-page">
      <div className="checkout-steps" aria-label="Стъпки на поръчката">
        <span>1. Количка</span>
        <span>2. Поръчка</span>
        <span className="active">3. Готово</span>
      </div>
      <p className="success-badge">
        <IconCheck size={22} aria-hidden />
        Поръчката е приета
      </p>
      <h1 className="page-title">Благодарим ви</h1>
      <p>
        Номер на поръчка: <strong>{order.id}</strong>
      </p>
      <p>Междинна сума: {formatBgn(Number(order.subtotalAmount ?? order.totalAmount))}</p>
      <p>Доставка ({courierLabel[order.courier] ?? order.courier}): {formatBgn(Number(order.shippingFee ?? 0))}</p>
      <p>
        Общо: <strong>{formatBgn(Number(order.totalAmount))}</strong>
      </p>
      <p>
        Плащане:{" "}
        {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod} ·{" "}
        {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
      </p>
      {order.rush ? <p className="muted">Ускорена изработка е заявена.</p> : null}
      {order.paymentMethod === "BANK_TRANSFER" ? (
        <div className="admin-card" style={{ marginTop: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Данни за банков превод</h3>
          <p>{bank.beneficiary}</p>
          <p>IBAN: <strong>{bank.iban}</strong></p>
          <p>BIC: {bank.bic}</p>
          <p>Банка: {bank.bankName}</p>
          <p>
            Основание: <strong>{bank.reasonPrefix} {order.id}</strong>
          </p>
        </div>
      ) : null}

      {cutDownloads.length > 0 ? (
        <section className="cut-files-panel" aria-labelledby="cut-files-heading">
          <h2 id="cut-files-heading" className="cut-files-title">
            Файлове за LightBurn
          </h2>
          <p className="muted cut-files-lead">
            Готови SVG за изрязване и гравиране. Отворете ги в LightBurn след
            покупката (червено = Cut, черно = Engrave).
          </p>
          <ul className="cut-files-list">
            {cutDownloads.map((file) => (
              <li key={file.slug}>
                <a className="btn btn-ghost cut-file-link" href={file.href} download>
                  Изтегли · {file.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="muted">
        Ще се свържем на {order.customerEmail} / {order.customerPhone}, за да
        потвърдим макета и срока за изработка.
      </p>
      <div className="cta-row" style={{ marginTop: "1.5rem" }}>
        <Link
          href={`/order/${order.id}/quote?t=${encodeURIComponent(t!)}`}
          className="btn btn-ghost"
          target="_blank"
        >
          PDF / печат оферта
        </Link>
        <Link href="/" className="btn btn-primary">
          Към началото
        </Link>
      </div>
    </div>
  );
}
