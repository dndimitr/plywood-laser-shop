"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "pls_recent";

export function TrackProductView({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const list: { slug: string; name: string }[] = raw ? JSON.parse(raw) : [];
      const next = [
        { slug, name },
        ...list.filter((x) => x.slug !== slug),
      ].slice(0, 6);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [slug, name]);
  return null;
}

export function RecentlyViewed() {
  const [list, setList] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    try {
      setList(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {
      setList([]);
    }
  }, []);

  if (!list.length) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 className="page-title" style={{ fontSize: "1.5rem" }}>
        Наскоро разгледани
      </h2>
      <ul style={{ paddingLeft: "1.1rem" }}>
        {list.map((item) => (
          <li key={item.slug}>
            <Link href={`/products/${item.slug}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
