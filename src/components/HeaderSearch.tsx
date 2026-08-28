"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconSearch } from "@/components/Icons";

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = q.trim();
    router.push(next ? `/katalog?q=${encodeURIComponent(next)}` : "/katalog");
  }

  return (
    <>
      <form className="header-search" onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="header-search-q">
          Търсене в каталога
        </label>
        <IconSearch size={16} aria-hidden />
        <input
          id="header-search-q"
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Търси подарък…"
          autoComplete="off"
        />
      </form>
      <Link
        href="/katalog"
        className="header-search-icon"
        aria-label="Търсене в каталога"
      >
        <IconSearch size={18} aria-hidden />
      </Link>
    </>
  );
}
