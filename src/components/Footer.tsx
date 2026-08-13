import Link from "next/link";
import { CATEGORIES } from "@/lib/shop-config";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div>
            <p className="brand" style={{ marginBottom: "0.75rem" }}>
              ЛазерШперплат
            </p>
            <p className="muted">
              Лазерно гравиране и изрязване на шперплат — по готов модел или
              ваш производствен файл.
            </p>
          </div>
          <div>
            <h3>Магазин</h3>
            <Link href="/#katalog">Каталог</Link>
            <Link href="/custom">Поръчка по файл</Link>
            <Link href="/cart">Количка</Link>
            <Link href="/account">Моите поръчки</Link>
          </div>
          <div>
            <h3>Категории</h3>
            <div className="footer-cats">
              {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
                <Link key={c.id} href={`/?cat=${c.id}#katalog`}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3>Информация</h3>
            <Link href="/legal/terms">Общи условия</Link>
            <Link href="/legal/privacy">Поверителност</Link>
            <Link href="/legal/returns">Рекламации</Link>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Еконт / Speedy · 2–5 раб. дни
            </p>
          </div>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          © {new Date().getFullYear()} ЛазерШперплат
        </p>
      </div>
    </footer>
  );
}
