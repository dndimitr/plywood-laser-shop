import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Страницата не е намерена",
  description: "Тази страница не съществува или е премахната.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="container empty-state">
      <h1 className="page-title">Страницата не е намерена</h1>
      <p className="muted">Проверете адреса или се върнете към магазина.</p>
      <Link href="/" className="btn btn-primary">
        Към началото
      </Link>
    </div>
  );
}
