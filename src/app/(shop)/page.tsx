import Link from "next/link";
import Image from "next/image";
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
import { JsonLd } from "@/components/JsonLd";
import { OccasionCards } from "@/components/OccasionCards";
import { ProductCard } from "@/components/ProductCard";
import { ProductSlider } from "@/components/ProductSlider";
import { StarRating } from "@/components/StarRating";
import {
  categoryLandingById,
  categoryLandingPath,
} from "@/lib/category-landings";
import { prisma } from "@/lib/db";
import { catalogProductWhere } from "@/lib/catalog-where";
import {
  OCCASIONS,
  occasionByCategoryId,
  occasionPath,
  categoryHref,
} from "@/lib/occasions";
import {
  FREE_SHIPPING_MIN_EUR,
  PRODUCTION_LEAD,
} from "@/lib/shop-config";
import {
  FEATURED_KITS,
  FEATURED_KIT_SLUGS,
} from "@/data/catalog-kits";
import {
  aggregateRatingJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  faqJsonLd,
  SITE_TAGLINE,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "Колко време отнема изработката?",
    a: "Обикновено 2–5 работни дни след като потвърдим макета. Ако празникът е близо, отбележете ускорена изработка — съгласуваме срока още при поръчката.",
  },
  {
    q: "Как добавям име или послание?",
    a: "При всеки модел има поле за гравиране: име, дата, инициали или кратко послание. Можете и да качите свой файл (SVG, PDF, PNG, JPG) — изрязваме го по вашия дизайн.",
  },
  {
    q: "Как плащам?",
    a: "Наложен платеж при куриера, банков превод или карта онлайн (когато е активна). Поръчвате без регистрация.",
  },
  {
    q: "Трябва ли акаунт?",
    a: "Не. Попълвате име, телефон и адрес — и поръчката тръгва. Ако искате история, можете да потърсите поръчките си по имейл.",
  },
];

type HomeProps = {
  searchParams: Promise<{ cat?: string; q?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: SITE_TAGLINE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  });
}

export default async function HomePage({ searchParams }: HomeProps) {
  const { cat, q } = await searchParams;
  if (q?.trim()) {
    redirect(`/katalog?q=${encodeURIComponent(q.trim())}`);
  }
  if (cat) {
    const occasion = occasionByCategoryId(cat);
    if (occasion) redirect(occasionPath(occasion.slug));
    const landing = categoryLandingById(cat);
    if (landing) redirect(categoryLandingPath(landing.slug));
    redirect(`/katalog?cat=${encodeURIComponent(cat)}`);
  }

  const productSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    category: true,
    basePrice: true,
    imageUrl: true,
  } as const;

  const [featuredPool, nurseryProducts, weddingProducts, kitPool, reviews, catalogMeta] =
    await Promise.all([
      prisma.product.findMany({
        where: { ...catalogProductWhere },
        select: productSelect,
        orderBy: { updatedAt: "desc" },
        take: 48,
      }),
      prisma.product.findMany({
        where: { ...catalogProductWhere, category: "nursery" },
        select: productSelect,
        orderBy: { name: "asc" },
        take: 4,
      }),
      prisma.product.findMany({
        where: { ...catalogProductWhere, category: "wedding" },
        select: productSelect,
        orderBy: { name: "asc" },
        take: 4,
      }),
      prisma.product.findMany({
        where: {
          ...catalogProductWhere,
          slug: { in: [...FEATURED_KIT_SLUGS] },
        },
        select: productSelect,
      }),
      prisma.review.findMany({
        where: { published: true },
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.product.findMany({
        where: { ...catalogProductWhere },
        select: { category: true, imageUrl: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const kitOrder = new Map(FEATURED_KITS.map((k, i) => [k.slug, i]));
  const kitBadge = new Map(FEATURED_KITS.map((k) => [k.slug, k.badge]));
  const kitProducts = [...kitPool].sort(
    (a, b) => (kitOrder.get(a.slug) ?? 99) - (kitOrder.get(b.slug) ?? 99),
  );

  const featuredSlider = featuredPool
    .filter((p) => Boolean(p.imageUrl))
    .slice(0, 8);

  const heroImage =
    featuredSlider[0]?.imageUrl ??
    weddingProducts[0]?.imageUrl ??
    nurseryProducts[0]?.imageUrl ??
    null;
  const heroAlt =
    featuredSlider[0]?.name ??
    weddingProducts[0]?.name ??
    nurseryProducts[0]?.name ??
    SITE_TAGLINE;

  const ratingLd = aggregateRatingJsonLd(reviews);

  const counts = new Map<string, number>();
  const covers = new Map<string, string>();
  for (const row of catalogMeta) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
    if (row.imageUrl && !covers.has(row.category)) {
      covers.set(row.category, row.imageUrl);
    }
  }

  const occasionCards = [
    ...OCCASIONS.map((o) => ({
      href: occasionPath(o.slug),
      label: o.navLabel,
      imageUrl: covers.get(o.categoryId) ?? null,
      count: counts.get(o.categoryId) ?? 0,
    })),
    {
      href: categoryHref("nursery"),
      label: "Детска",
      imageUrl: covers.get("nursery") ?? null,
      count: counts.get("nursery") ?? 0,
    },
  ].filter((item) => item.count > 0);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Начало", path: "/" }]),
          faqJsonLd(faqs),
          ...(ratingLd ? [ratingLd] : []),
        ]}
      />
      <section className="hero hero--home" aria-label="Начало">
        {heroImage ? (
          <div className="hero-media hero-media--product">
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              priority
              sizes="(max-width: 899px) 100vw, 70vw"
              className="object-contain"
              unoptimized={heroImage.endsWith(".svg")}
            />
            <div className="hero-scrim" />
          </div>
        ) : (
          <div className="hero-media hero-media--product" aria-hidden />
        )}
        <div className="container hero-copy">
          <p className="hero-kicker">Studio Breza · Варна</p>
          <h1>Подарък с име — който се помни</h1>
          <p>
            Гравираме име, дата или послание върху брезов шперплат. За сватба,
            рожден ден, кръщене и всеки повод — готов модел или ваш дизайн, с
            доставка в цяла България.
          </p>
          <div className="cta-row">
            <Link href="/katalog" className="btn btn-primary">
              Избери подарък
            </Link>
            <Link href="/custom" className="btn btn-ghost">
              Имам свой дизайн
            </Link>
          </div>
        </div>
      </section>

      <section className="home-proof" aria-label="Предимства">
        <div className="container home-proof-inner">
          <p>
            <IconPackage size={18} aria-hidden />
            <span>Готово за {PRODUCTION_LEAD.standardLabel}</span>
          </p>
          <p>
            <IconShield size={18} aria-hidden />
            <span>Поръчка без регистрация</span>
          </p>
          <p>
            <IconTruck size={18} aria-hidden />
            <span>Безплатна доставка над {FREE_SHIPPING_MIN_EUR} €</span>
          </p>
        </div>
      </section>

      {kitProducts.length > 0 ? (
        <section
          id="komplekti"
          className="section container"
          aria-labelledby="komplekti-heading"
        >
          <h2 id="komplekti-heading">Готови комплекти — с безплатна доставка</h2>
          <p className="section-lead">
            Пет готови подаръка. Цените са 9–13% под сбора на отделните модели:
            една лазерна подготовка и една пратка. Всеки комплект е над{" "}
            {FREE_SHIPPING_MIN_EUR} €.
          </p>
          <div className="product-grid">
            {kitProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  name: p.name,
                  slug: p.slug,
                  description: p.description,
                  basePrice: Number(p.basePrice),
                  imageUrl: p.imageUrl,
                  badge: kitBadge.get(p.slug) ?? "Комплект",
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="izbrani"
        className="section container"
        aria-labelledby="izbrani-heading"
      >
        <h2 id="izbrani-heading">Най-търсените модели</h2>
        <p className="section-lead">
          Добавете името още при поръчката — подарък, който се слага на масата
          и остава в спомените.
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
        <p style={{ marginTop: "1.25rem" }}>
          <Link href="/katalog" className="btn btn-ghost">
            Виж всички модели
          </Link>
        </p>
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
        <OccasionCards items={occasionCards} />
      </section>

      {nurseryProducts.length > 0 ? (
        <section
          id="detska"
          className="section container"
          aria-labelledby="detska-heading"
        >
          <h2 id="detska-heading">Детска и Монтесори</h2>
          <p className="section-lead">
            Сглобяване, оцветяване и сензорни материали от шперплат — без
            екрани.
          </p>
          <div className="product-grid">
            {nurseryProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  name: p.name,
                  slug: p.slug,
                  description: p.description,
                  basePrice: Number(p.basePrice),
                  imageUrl: p.imageUrl,
                  badge: "Детска",
                }}
              />
            ))}
          </div>
          <p style={{ marginTop: "1.25rem" }}>
            <Link href={categoryHref("nursery")} className="btn btn-ghost">
              Виж всички детски
            </Link>
          </p>
        </section>
      ) : null}

      {weddingProducts.length > 0 ? (
        <section
          id="svatba"
          className="section section-alt container"
          aria-labelledby="svatba-heading"
        >
          <h2 id="svatba-heading">За сватбата</h2>
          <p className="section-lead">
            Welcome табели, топери и персонализирани акценти за голямия ден.
          </p>
          <div className="product-grid">
            {weddingProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  name: p.name,
                  slug: p.slug,
                  description: p.description,
                  basePrice: Number(p.basePrice),
                  imageUrl: p.imageUrl,
                  badge: "Сватба",
                }}
              />
            ))}
          </div>
          <p style={{ marginTop: "1.25rem" }}>
            <Link href={categoryHref("wedding")} className="btn btn-ghost">
              Виж всички сватбени
            </Link>
          </p>
        </section>
      ) : null}

      <section id="kak-raboti" className="section container">
        <h2>Как протича поръчката</h2>
        <p className="section-lead">
          От идея до готов подарък — в три стъпки.
        </p>
        <div className="steps">
          <article className="step">
            <div className="step-num">
              <IconUpload size={22} aria-hidden />
              <span>01</span>
            </div>
            <h3>Изберете модел или качете дизайн</h3>
            <p>
              Вземете готов шаблон с опции за текст или качете SVG, PDF, PNG
              или JPG.
            </p>
          </article>
          <article className="step">
            <div className="step-num">
              <IconPencil size={22} aria-hidden />
              <span>02</span>
            </div>
            <h3>Добавете персонализация</h3>
            <p>
              Име, дата или послание. Виждате цената още преди да платите —
              с отстъпка при повече бройки.
            </p>
          </article>
          <article className="step">
            <div className="step-num">
              <IconTruck size={22} aria-hidden />
              <span>03</span>
            </div>
            <h3>Изработка и доставка</h3>
            <p>
              Потвърждаваме макета при нужда, изработваме поръчката и
              изпращаме с куриер.
            </p>
          </article>
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
              <span>Ясна сума + отстъпки за количество</span>
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

      {reviews.length > 0 ? (
        <section className="section section-alt">
          <div className="container">
            <h2>Отзиви</h2>
            <p className="section-lead">Реални впечатления от клиенти.</p>
            <div className="review-grid">
              {reviews.map((r) => (
                <article key={r.id} className="review-card">
                  <StarRating rating={r.rating} />
                  <p className="review-card-body">{r.body}</p>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    — {r.authorName}
                    {r.product?.name ? ` · ${r.product.name}` : ""}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
          <p style={{ marginTop: "1.75rem" }}>
            <Link href="/katalog" className="btn btn-primary">
              Към каталога
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

