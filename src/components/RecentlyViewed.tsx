"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBgn } from "@/lib/pricing";

const KEY = "pls_recent";
const MAX = 8;

export type RecentProduct = {
  slug: string;
  name: string;
  imageUrl?: string | null;
  basePrice?: number | null;
};

function readRecent(): RecentProduct[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function TrackProductView({
  slug,
  name,
  imageUrl,
  basePrice,
}: RecentProduct) {
  useEffect(() => {
    try {
      const list = readRecent();
      const next = [
        {
          slug,
          name,
          imageUrl: imageUrl ?? null,
          basePrice: basePrice ?? null,
        },
        ...list.filter((x) => x.slug !== slug),
      ].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [slug, name, imageUrl, basePrice]);
  return null;
}

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [list, setList] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const items = readRecent().filter((x) => x.slug !== excludeSlug);
    setList(items);
  }, [excludeSlug]);

  if (!list.length) return null;

  return (
    <section className="recently-viewed" aria-labelledby="recently-viewed-title">
      <div className="recently-viewed-head">
        <h2 id="recently-viewed-title">Наскоро разгледани</h2>
      </div>
      <div className="recently-viewed-scroller">
        {list.map((item) => (
          <Link
            key={item.slug}
            href={`/products/${item.slug}`}
            className="recent-card"
          >
            <div className="recent-card-media">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width:639px) 42vw, 160px"
                  style={{ objectFit: "contain" }}
                  unoptimized={item.imageUrl.endsWith(".svg")}
                />
              ) : (
                <div className="product-card-placeholder" aria-hidden />
              )}
            </div>
            <div className="recent-card-body">
              <span className="recent-card-title">{item.name}</span>
              {typeof item.basePrice === "number" ? (
                <span className="price">от {formatBgn(item.basePrice)}</span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
