import Link from "next/link";
import Image from "next/image";

export type OccasionCardItem = {
  href: string;
  label: string;
  imageUrl: string | null;
  count: number;
};

export function OccasionCards({ items }: { items: OccasionCardItem[] }) {
  if (!items.length) return null;

  return (
    <div className="occasion-grid">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="occasion-card">
          <div className="occasion-card-media">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="(max-width:639px) 50vw, (max-width:899px) 33vw, 25vw"
                className="object-cover"
                style={{ objectFit: "cover" }}
                unoptimized={item.imageUrl.endsWith(".svg")}
              />
            ) : (
              <div className="product-card-placeholder" aria-hidden />
            )}
          </div>
          <div className="occasion-card-body">
            <h3>{item.label}</h3>
            <span className="muted">
              {item.count} {item.count === 1 ? "модел" : "модела"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
