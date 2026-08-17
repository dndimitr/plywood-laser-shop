import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/Icons";
import { formatBgn } from "@/lib/pricing";

type Props = {
  product: {
    name: string;
    slug: string;
    description: string;
    basePrice: number | string;
    imageUrl: string | null;
    badge?: string | null;
  };
};

export function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.slug}`} className="product-card">
      <div className="product-card-media">
        {product.badge ? (
          <span className="product-card-badge">{product.badge}</span>
        ) : null}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:639px) 50vw, (max-width:899px) 50vw, 33vw"
            className="object-contain"
            style={{ objectFit: "contain" }}
            unoptimized={product.imageUrl.endsWith(".svg")}
          />
        ) : (
          <div className="product-card-placeholder" aria-hidden />
        )}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span className="price">от {formatBgn(Number(product.basePrice))}</span>
        <span className="product-card-cta muted">
          Конфигурирай <IconArrowRight size={14} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
