import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";
import { prisma } from "@/lib/db";
import { getShopPhone, getShopPhoneHref } from "@/lib/shop-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "За бизнеса",
  description:
    "Табели, менюта и корпоративни изделия от шперплат за заведения и фирми — с фактура и оферта.",
};

export default async function BusinessPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      category: { in: ["venues", "corporate", "signs"] },
    },
    orderBy: { name: "asc" },
    take: 12,
  });
  const phone = getShopPhone();
  const phoneHref = getShopPhoneHref();

  return (
    <>
      <section className="business-hero">
        <div className="container business-hero-inner">
          <p className="hero-brand">За заведения и фирми</p>
          <h1>Табели, менюта и корпоративни изделия от шперплат</h1>
          <p>
            Готови модели за ресторанти и офиси или изработка по ваше лого.
            Фактура, банков превод и персонална оферта за по-големи количества.
          </p>
          <div className="cta-row">
            <Link href="/katalog?cat=venues" className="btn btn-primary">
              Заведения
            </Link>
            <Link href="/katalog?cat=corporate" className="btn btn-ghost">
              Корпоративни
            </Link>
            <Link href="/custom" className="btn btn-ghost">
              Качи лого / файл
            </Link>
          </div>
          <p className="muted" style={{ marginTop: "1rem" }}>
            Телефон: <a href={phoneHref}>{phone}</a>
          </p>
        </div>
      </section>

      <section className="section container">
        <h2>Популярни за бизнеса</h2>
        <p className="section-lead">
          Менюта, QR стойки, табели и подаръчни комплекти с фирмено лого.
        </p>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                name: product.name,
                slug: product.slug,
                description: product.description,
                basePrice: Number(product.basePrice),
                imageUrl: product.imageUrl,
              }}
            />
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: "1.5rem" }}>
          <Link href="/katalog?cat=venues" className="btn btn-ghost">
            Всички за заведения
          </Link>
          <Link href="/katalog?cat=signs" className="btn btn-ghost">
            Табели
          </Link>
        </div>
      </section>

      <section id="oferta" className="section section-alt">
        <div className="container business-quote-grid">
          <div>
            <h2>Как работим с фирми</h2>
            <ul className="business-points">
              <li>Фактура с ЕИК при поръчка</li>
              <li>Банков превод и печатна оферта</li>
              <li>Изработка по векторно лого (SVG, AI, PDF)</li>
              <li>По-големи количества — персонална оферта</li>
            </ul>
          </div>
          <QuoteRequestForm
            defaultSource="business"
            title="Заявка за оферта"
            lead="Опишете обекта, количеството и срока — връщаме се с оферта."
          />
        </div>
      </section>
    </>
  );
}
