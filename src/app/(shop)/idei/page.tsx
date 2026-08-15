import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { GIFT_GUIDES, giftGuidePath } from "@/lib/gift-guides";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Идеи за персонализирани подаръци",
  description:
    "Ръководства и идеи за подарък за кръщене, новородено, сватба и рожден ден с гравиране. Как да изберете и да поръчате навреме.",
  path: "/idei",
  type: "article",
});

export default function GiftIdeasIndexPage() {
  return (
    <div className="container guide-index">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Начало", path: "/" },
            { name: "Идеи", path: "/idei" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Идеи за персонализирани подаръци",
            url: absoluteUrl("/idei"),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: GIFT_GUIDES.map((g, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(giftGuidePath(g.slug)),
                name: g.headline,
              })),
            },
          },
        ]}
      />

      <nav className="product-breadcrumb" aria-label="Навигация">
        <Link href="/">Начало</Link>
        <span aria-hidden>/</span>
        <span>Идеи</span>
      </nav>

      <h1 className="page-title">Идеи за персонализирани подаръци</h1>
      <p className="section-lead">
        Кратки ръководства за поводи — кръщене, новородено, сватба, рожден ден —
        с практически съвети за текст, срокове и модели от каталога.
      </p>

      <ul className="guide-list">
        {GIFT_GUIDES.map((g) => (
          <li key={g.slug} className="guide-list-item">
            <Link href={giftGuidePath(g.slug)} className="guide-list-link">
              <h2>{g.headline}</h2>
              <p className="muted">{g.description}</p>
              <span className="guide-list-cta">Прочети →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
