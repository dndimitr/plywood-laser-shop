import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  IconPackage,
  IconPencil,
  IconScales,
  IconShield,
  IconTruck,
  IconUpload,
} from "@/components/Icons";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "Какъв е срокът за изработка?",
    a: "Стандартно 2–5 работни дни след потвърждение на поръчката и макета. Ускорена изработка е 1–2 работни дни и оскъпява изделията с +50%.",
  },
  {
    q: "Какви файлове са подходящи за лазер?",
    a: "Препоръчваме векторен SVG или PDF за изрязване. Приемаме и PNG/JPG до 8 MB за гравиране.",
  },
  {
    q: "Какви начини на плащане предлагате?",
    a: "Банков превод, наложен платеж и онлайн карта (когато е активирана).",
  },
  {
    q: "Трябва ли регистрация?",
    a: "Не. Поръчвате без акаунт. Можете и да си направите профил за история на поръчките.",
  },
];

export default async function HomePage() {
  const [products, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.review.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <section className="hero" aria-label="Начало">
        <div className="hero-media">
          <Image
            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=2000&q=80"
            alt="Лазерна обработка на шперплат в работилница"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-scrim" />
        </div>
        <div className="container hero-copy">
          <p className="hero-brand">ЛазерШперплат</p>
          <h1>Лазерно изрязване и гравиране на шперплат</h1>
          <p>
            Готови модели с персонализация или производство по ваш файл.
            Точни размери, чисти ръбове и доставка с Еконт или Speedy.
          </p>
          <div className="cta-row">
            <Link href="#katalog" className="btn btn-primary">
              Разгледай каталога
            </Link>
            <Link
              href="/custom"
              className="btn btn-ghost"
              style={{ color: "#f7f1e8" }}
            >
              Поръчай по файл
            </Link>
          </div>
        </div>
      </section>

      <section id="kak-raboti" className="section container">
        <h2>Как протича поръчката</h2>
        <p className="section-lead">
          От избор на модел или файл до готова детайл — в три стъпки.
        </p>
        <div className="steps">
          <article className="step">
            <div className="step-num">01</div>
            <h3>Изберете модел или качете файл</h3>
            <p>
              Вземете готов шаблон с опции или качете SVG, PDF, PNG или JPG.
            </p>
          </article>
          <article className="step">
            <div className="step-num">02</div>
            <h3>Задайте параметри</h3>
            <p>
              Дебелина, материал, финиш и сложност. Цената се преизчислява на
              сървъра при поръчка.
            </p>
          </article>
          <article className="step">
            <div className="step-num">03</div>
            <h3>Производство и доставка</h3>
            <p>
              Потвърждаваме макета при нужда, изработваме с лазер и изпращаме с
              куриер.
            </p>
          </article>
        </div>
      </section>

      <section id="katalog" className="section section-alt" style={{ scrollMarginTop: "var(--header-h)" }}>
        <div className="container">
          <h2>Каталог</h2>
          <p className="section-lead">
            Готови модели по поводи, дом, бизнес и аксесоари.
          </p>
          <Suspense fallback={<p className="muted">Зареждане…</p>}>
            <CatalogBrowser
              products={products.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                description: p.description,
                category: p.category ?? "other",
                basePrice: Number(p.basePrice),
                imageUrl: p.imageUrl,
              }))}
            />
          </Suspense>
        </div>
      </section>

      <section className="section container">
        <div className="band">
          <div>
            <h2>Имате готов макет?</h2>
            <p>
              Качете файла и получете ориентировъчна цена. За изрязване
              препоръчваме векторен контур.
            </p>
            <Link href="/custom" className="btn btn-primary">
              <IconUpload size={18} aria-hidden />
              Качи файл за оферта
            </Link>
          </div>
          <div className="trust trust-on-dark">
            <div className="trust-item">
              <IconPencil size={22} aria-hidden />
              <div>
                <strong>Гравиране</strong>
                <span>Текст, логотипи, орнаменти</span>
              </div>
            </div>
            <div className="trust-item">
              <IconScales size={22} aria-hidden />
              <div>
                <strong>Изрязване</strong>
                <span>Контур по векторен файл</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Производствени предимства</h2>
        <div className="trust">
          <div className="trust-item">
            <IconPackage size={24} aria-hidden />
            <div>
              <strong>Каталог и поръчка по файл</strong>
              <span>Готови модели или ваш дизайн</span>
            </div>
          </div>
          <div className="trust-item">
            <IconScales size={24} aria-hidden />
            <div>
              <strong>Цена преди производство</strong>
              <span>Сървърна калкулация + отстъпки за количество</span>
            </div>
          </div>
          <div className="trust-item">
            <IconTruck size={24} aria-hidden />
            <div>
              <strong>Доставка с куриер</strong>
              <span>Еконт, Speedy или лично</span>
            </div>
          </div>
          <div className="trust-item">
            <IconShield size={24} aria-hidden />
            <div>
              <strong>Поръчка без регистрация</strong>
              <span>Защитен линк към поръчката</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2>Отзиви</h2>
          <p className="section-lead">Реални впечатления от клиенти.</p>
          <div className="product-grid">
            {reviews.map((r) => (
              <article key={r.id} className="admin-card">
                <p style={{ margin: 0, fontWeight: 700 }}>
                  Оценка {r.rating}/5
                </p>
                <p>{r.body}</p>
                <p className="muted" style={{ marginBottom: 0 }}>
                  — {r.authorName}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container">
          <h2>Често задавани въпроси</h2>
          <div className="faq">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
