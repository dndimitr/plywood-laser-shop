"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IconClose } from "@/components/Icons";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = images[active] ?? images[0];

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  if (!images.length) {
    return <div className="detail-media detail-media-empty" aria-hidden />;
  }

  return (
    <div className="product-gallery">
      <button
        type="button"
        className="detail-media"
        onClick={() => setLightbox(true)}
        aria-label={`Увеличи снимката на ${alt}`}
      >
        <Image
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width:899px) 100vw, 55vw"
          className="object-contain"
          style={{ objectFit: "contain" }}
          unoptimized={current.endsWith(".svg")}
        />
      </button>

      {images.length > 1 ? (
        <div className="gallery-thumbs" role="listbox" aria-label="Галерия">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              role="option"
              aria-selected={index === active}
              className={`gallery-thumb${index === active ? " is-active" : ""}`}
              onClick={() => setActive(index)}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="96px"
                style={{ objectFit: "contain" }}
                unoptimized={url.endsWith(".svg")}
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setLightbox(false)}
            aria-label="Затвори"
          >
            <IconClose size={20} aria-hidden />
          </button>
          <div
            className="gallery-lightbox-stage"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ objectFit: "contain" }}
              unoptimized={current.endsWith(".svg")}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
