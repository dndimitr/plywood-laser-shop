"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/Icons";
import { formatBgn } from "@/lib/pricing";

export type SliderProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string | null;
};

type Props = {
  products: SliderProduct[];
};

const AUTO_MS = 4500;

export function ProductSlider({ products }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = products.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [count, paused, reduceMotion]);

  if (count === 0) return null;

  const product = products[index]!;

  return (
    <div
      className="product-slider"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="product-slider-stage" aria-live="polite">
        <Link
          href={`/products/${product.slug}`}
          className="product-slider-card"
        >
          <div className="product-slider-media">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width:639px) 100vw, 560px"
                className="object-contain"
                style={{ objectFit: "contain" }}
                unoptimized={product.imageUrl.endsWith(".svg")}
                priority={index === 0}
              />
            ) : (
              <div className="product-card-placeholder" aria-hidden />
            )}
          </div>
          <div className="product-slider-body">
            <p className="product-slider-kicker">Избрано от каталога</p>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span className="price">от {formatBgn(product.basePrice)}</span>
          </div>
        </Link>
      </div>

      <div className="product-slider-controls">
        <button
          type="button"
          className="product-slider-nav"
          aria-label="Предишен продукт"
          onClick={() => setIndex((i) => (i - 1 + count) % count)}
        >
          <IconChevronLeft size={20} aria-hidden />
        </button>
        <div className="product-slider-dots" role="tablist" aria-label="Слайдове">
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Продукт ${i + 1}: ${p.name}`}
              className={
                i === index
                  ? "product-slider-dot is-active"
                  : "product-slider-dot"
              }
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="product-slider-nav"
          aria-label="Следващ продукт"
          onClick={() => setIndex((i) => (i + 1) % count)}
        >
          <IconChevronRight size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
