import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import {
  GIFT_GUIDES,
  giftGuideBySlug,
  giftGuidePath,
} from "@/lib/gift-guides";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  faqJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GIFT_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = giftGuideBySlug(slug);
  if (!guide) return { title: "Идея" };
  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: giftGuidePath(guide.slug),
    type: "article",
  });
}

export default async function GiftGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = giftGuideBySlug(slug);
  if (!guide) notFound();

  const others = GIFT_GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <article className="container guide-article">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Начало", path: "/" },
            { name: "Идеи", path: "/idei" },
            { name: guide.headline, path: giftGuidePath(guide.slug) },
          ]),
          faqJsonLd(guide.faqs),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.headline,
            description: guide.description,
            datePublished: guide.publishedAt,
            dateModified: guide.publishedAt,
            inLanguage: "bg-BG",
            mainEntityOfPage: absoluteUrl(giftGuidePath(guide.slug)),
            author: {
              "@type": "Organization",
              name: "Studio Breza",
            },
            publisher: {
              "@type": "Organization",
              name: "Studio Breza",
            },
          },
        ]}
      />

      <nav className="product-breadcrumb" aria-label="Навигация">
        <Link href="/">Начало</Link>
        <span aria-hidden>/</span>
        <Link href="/idei">Идеи</Link>
        <span aria-hidden>/</span>
        <span>{guide.relatedLabel}</span>
      </nav>

      <header className="guide-article-header">
        <p className="muted guide-article-date">
          Обновено:{" "}
          {new Date(guide.publishedAt).toLocaleDateString("bg-BG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="page-title">{guide.headline}</h1>
        <p className="section-lead">{guide.intro}</p>
        <Link href={guide.relatedHref} className="btn btn-primary">
          Към {guide.relatedLabel}
        </Link>
      </header>

      <div className="guide-article-body">
        {guide.sections.map((section) => (
          <section key={section.heading} className="guide-section">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>

      {guide.faqs.length > 0 ? (
        <section className="guide-faq">
          <h2>Често задавани въпроси</h2>
          <div className="faq">
            {guide.faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="guide-more">
        <h2>Още идеи</h2>
        <div className="occasion-chips">
          {others.map((g) => (
            <Link
              key={g.slug}
              href={giftGuidePath(g.slug)}
              className="occasion-chip"
            >
              {g.relatedLabel}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
