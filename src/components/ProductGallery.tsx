"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!images.length) {
    return <div className="detail-media detail-media-empty" aria-hidden />;
  }

  return (
    <div className="product-gallery">
      <div className="detail-media">
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
      </div>

      {images.length > 1 ? (
        <div
          className="gallery-thumbs"
          role="listbox"
          aria-label="Галерия"
        >
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
    </div>
  );
}
