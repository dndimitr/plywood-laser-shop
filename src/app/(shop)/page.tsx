import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  IconPackage,
  IconPencil,
  IconScales,
  IconShield,
  IconTruck,
  IconUpload,
} from "@/components/Icons";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { BrandLogo } from "@/components/BrandLogo";
import { JsonLd } from "@/components/JsonLd";
import { ProductSlider } from "@/components/ProductSlider";
import { categoryLandingById, categoryLandingPath } from "@/lib/category-landings";
import { prisma } from "@/lib/db";
import {
  OCCASIONS,
  occasionByCategoryId,
  occasionPath,
} from "@/lib/occasions";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  categorySeo,
  DEFAULT_DESCRIPTION,
  faqJsonLd,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "Какъв е срокът за изработка?",
    a: "Стандартно 2–5 работни дни след потвърждение на поръчката и макета. При ускорена поръчка срокът се съгласува допълнително.",
  },
  {
    q: "Как се добавя персонализация?",
    a: "При поръчка напишете име, дата или послание. Приемаме и ваш файл (SVG, PDF, PNG, JPG) за изработка по дизайн.",
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

type HomeProps = {
  searchParams: Promise<{ cat?: string; q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: HomeProps): Promise<Metadata> {
  const { cat, q } = await searchParams;
  if (q?.trim()) {
    return buildPageMetadata({
      title: `Търсене: ${q.trim()}`,
      description: `Резултати от каталога на ${SITE_NAME} за „${q.trim()}“.`,
      path: `/?q=${encodeURIComponent(q.trim())}`,
      noIndex: true,
    });
  }
  const catMeta = categorySeo(cat);
  if (catMeta) {
    return buildPageMetadata({
      title: catMeta.title,
      description: catMeta.description,
      path: catMeta.path,
    });
  }
  return buildPageMetadata({
    title: SITE_TAGLINE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  });
}

export default async function HomePage({ searchParams }: HomeProps) {
  const { cat } = await searchParams;
  if (cat) {
    const occasion = occasionByCategoryId(cat);
    if (occasion) redirect(occasionPath(occasion.slug));
    const landing = categoryLandingById(cat);
    if (landing) redirect(categoryLandingPath(landing.slug));
  }

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

  const featuredSlider = pickRandomProducts(
    products.filter((p) => Boolean(p.imageUrl)),
    8,
  );

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Начало", path: "/" }]),
          faqJsonLd(faqs),
        ]}
      />
      <section className="hero" aria-label="Начало">
        <div className="hero-media hero-media--product">
          <Image
            src="/products/photos/svatbena-welcome.png"
            alt="Персонализирана сватбена welcome табела с имена"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-scrim" />
        </div>
        <div className="container hero-copy">
          <p className="hero-brand">
            <BrandLogo variant="hero" priority />
          </p>
          <h1>Персонализирани подаръци и украси</h1>
          <p>
            С име, дата или послание — за сватба, рожден ден, кръщене и всеки
            специален повод. Готов модел или ваш дизайн, с доставка в цяла
            България.
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
              Поръчай по дизайн
            </Link>
          </div>
        </div>
      </section>

      <section
        id="izbrani"
        className="section container"
        aria-labelledby="izbrani-heading"
      >
        <h2 id="izbrani-heading">Избрани модели</h2>
        <p className="section-lead">
          Случайна селекция от каталога — персонализирайте с име, дата или
          послание.
        </p>
        <ProductSlider
          products={featuredSlider.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            basePrice: Number(p.basePrice),
            imageUrl: p.imageUrl,
          }))}
        />
      </section>

      <section
        id="povodi"
        className="section section-alt container"
        aria-labelledby="povodi-heading"
      >
        <h2 id="povodi-heading">Поводи</h2>
        <p className="section-lead">
          Изберете повод и вижте готови модели с персонализация.
        </p>
        <div className="occasion-chips">
          {OCCASIONS.map((o) => (
            <Link
              key={o.slug}
              href={occasionPath(o.slug)}
              className="occasion-chip"
            >
              {o.navLabel}
            </Link>
          ))}
        </div>
      </section>

      <section id="kak-raboti" className="section container">
        <h2>Как протича поръчката</h2>
        <p className="section-lead">
          От идея до готов подарък — в три стъпки.
        </p>
        <div className="steps">
          <article className="step">
            <div className="step-num">01</div>
            <h3>Изберете модел или качете дизайн</h3>
            <p>
              Вземете готов шаблон с опции за текст или качете SVG, PDF, PNG
              или JPG.
            </p>
          </article>
          <article className="step">
            <div className="step-num">02</div>
            <h3>Добавете персонализация</h3>
            <p>
              Име, дата, послание и размер. Цената се преизчислява на сървъра
              при поръчка.
            </p>
          </article>
          <article className="step">
            <div className="step-num">03</div>
            <h3>Изработка и доставка</h3>
            <p>
              Потвърждаваме макета при нужда, изработваме поръчката и
              изпращаме с куриер.
            </p>
          </article>
        </div>
      </section>

      <section
        id="katalog"
        className="section"
        style={{ scrollMarginTop: "var(--header-h)" }}
      >
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
            <h2>Имате свой дизайн?</h2>
            <p>
              Качете файла и получете ориентировъчна цена преди поръчка.
              Подходящо за уникални подаръци и фирмени проекти.
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
                <span>Име, дата, послание, лого</span>
              </div>
            </div>
            <div className="trust-item">
              <IconScales size={22} aria-hidden />
              <div>
                <strong>Форма по контур</strong>
                <span>Топери, табели, фигури</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Защо при нас</h2>
        <div className="trust">
          <div className="trust-item">
            <IconPackage size={24} aria-hidden />
            <div>
              <strong>Каталог и поръчка по дизайн</strong>
              <span>Готови модели или ваш файл</span>
            </div>
          </div>
          <div className="trust-item">
            <IconScales size={24} aria-hidden />
            <div>
              <strong>Цена преди изработка</strong>
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

function pickRandomProducts<T>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy.slice(0, count);
}
