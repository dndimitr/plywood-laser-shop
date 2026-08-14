import Link from "next/link";
import {
  featuredCategories,
  navCategoryGroups,
} from "@/lib/shop-config";

export function Footer() {
  const featured = featuredCategories();
  const groups = navCategoryGroups();

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
            <h3>Популярни</h3>
            <div className="footer-cats">
              {featured.map((c) => (
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
              Безплатна доставка над 50 € · 2–5 раб. дни
            </p>
            <details className="footer-all-cats">
              <summary>Всички категории</summary>
              <div className="footer-all-cats-grid">
                {groups.map(({ group, categories }) => (
                  <div key={group.id}>
                    <p className="footer-group-label">{group.label}</p>
                    {categories.map((c) => (
                      <Link key={c.id} href={`/?cat=${c.id}#katalog`}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          © {new Date().getFullYear()} ЛазерШперплат
        </p>
      </div>
    </footer>
  );
}
