import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import {
  blogIndexPath,
  giftGuidePath,
  giftGuidesNewestFirst,
} from "@/lib/gift-guides";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  SITE_NAME,
} from "@/lib/seo";

const posts = giftGuidesNewestFirst();

export const metadata: Metadata = buildPageMetadata({
  title: "Блог — идеи за персонализирани подаръци",
  description:
    "Блог на Studio Breza: 10 статии за подарък за кръщене, новородено, сватба, рожден ден, Коледа и как да поръчате с гравиране. Съвети и срокове.",
  path: blogIndexPath(),
  type: "article",
});

export default function BlogIndexPage() {
  return (
    <div className="container guide-index">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Начало", path: "/" },
            { name: "Блог", path: blogIndexPath() },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `Блог · ${SITE_NAME}`,
            description:
              "Идеи и ръководства за персонализирани подаръци с гравиране.",
            url: absoluteUrl(blogIndexPath()),
            blogPost: posts.map((g) => ({
              "@type": "BlogPosting",
              headline: g.headline,
              description: g.description,
              datePublished: g.publishedAt,
              url: absoluteUrl(giftGuidePath(g.slug)),
              image: absoluteUrl(g.coverImage.src),
              inLanguage: "bg-BG",
            })),
          },
        ]}
      />

      <nav className="product-breadcrumb" aria-label="Навигация">
        <Link href="/">Начало</Link>
        <span aria-hidden>/</span>
        <span>Блог</span>
      </nav>

      <h1 className="page-title">Блог: идеи за персонализирани подаръци</h1>
      <p className="section-lead">
        {posts.length} статии за поводи, гравиране и поръчка — кръщене,
        новородено, сватба, рожден ден, Коледа и още. Практически съвети за
        текст, срокове и доставка в България.
      </p>

      <ul className="guide-list">
        {posts.map((g) => (
          <li key={g.slug} className="guide-list-item">
            <Link href={giftGuidePath(g.slug)} className="guide-list-link">
              <span className="guide-list-thumb">
                <Image
                  src={g.coverImage.src}
                  alt={g.coverImage.alt}
                  width={320}
                  height={320}
                  sizes="(max-width: 640px) 100vw, 280px"
                />
              </span>
              <span className="guide-list-copy">
                <time
                  className="muted guide-list-date"
                  dateTime={g.publishedAt}
                >
                  {new Date(g.publishedAt).toLocaleDateString("bg-BG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2>{g.headline}</h2>
                <p className="muted">{g.description}</p>
                <span className="guide-list-cta">Прочети статията →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
