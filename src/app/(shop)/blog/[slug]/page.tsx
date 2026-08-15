import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import {
  blogIndexPath,
  GIFT_GUIDES,
  giftGuideBySlug,
  giftGuidePath,
  giftGuidesNewestFirst,
} from "@/lib/gift-guides";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  faqJsonLd,
  SITE_NAME,
} from "@/lib/seo";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GIFT_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = giftGuideBySlug(slug);
  if (!guide) return { title: "Статия" };
  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: giftGuidePath(guide.slug),
    type: "article",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const guide = giftGuideBySlug(slug);
  if (!guide) notFound();

  const others = giftGuidesNewestFirst()
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 6);

  return (
    <article className="container guide-article">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Начало", path: "/" },
            { name: "Блог", path: blogIndexPath() },
            { name: guide.headline, path: giftGuidePath(guide.slug) },
          ]),
          faqJsonLd(guide.faqs),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: guide.headline,
            description: guide.description,
            datePublished: guide.publishedAt,
            dateModified: guide.publishedAt,
            inLanguage: "bg-BG",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": absoluteUrl(giftGuidePath(guide.slug)),
            },
            author: {
              "@type": "Organization",
              name: SITE_NAME,
            },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              logo: {
                "@type": "ImageObject",
                url: absoluteUrl("/opengraph-image"),
              },
            },
            image: absoluteUrl("/opengraph-image"),
          },
        ]}
      />

      <nav className="product-breadcrumb" aria-label="Навигация">
        <Link href="/">Начало</Link>
        <span aria-hidden>/</span>
        <Link href={blogIndexPath()}>Блог</Link>
        <span aria-hidden>/</span>
        <span>{guide.relatedLabel}</span>
      </nav>

      <header className="guide-article-header">
        <p className="muted guide-article-date">
          Публикувано:{" "}
          <time dateTime={guide.publishedAt}>
            {new Date(guide.publishedAt).toLocaleDateString("bg-BG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </p>
        <h1 className="page-title">{guide.headline}</h1>
        <p className="section-lead">{guide.intro}</p>
        <div className="cta-row">
          <Link href={guide.relatedHref} className="btn btn-primary">
            Към {guide.relatedLabel}
          </Link>
          <Link href={blogIndexPath()} className="btn btn-ghost">
            Всички статии
          </Link>
        </div>
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
        <h2>Още от блога</h2>
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
