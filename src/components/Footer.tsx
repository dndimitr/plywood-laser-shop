import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { categoryHref } from "@/lib/occasions";
import {
  featuredCategories,
  getShopAddress,
  getShopPhone,
  getShopPhoneHref,
  navCategoryGroups,
} from "@/lib/shop-config";
import { getMarketingSettings } from "@/lib/shop-settings";
import { SITE_NAME } from "@/lib/seo";

export function Footer() {
  const featured = featuredCategories();
  const groups = navCategoryGroups();
  const { facebookPageUrl } = getMarketingSettings();
  const phone = getShopPhone();
  const phoneHref = getShopPhoneHref();
  const address = getShopAddress();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div>
            <p className="brand brand--logo" style={{ marginBottom: "0.75rem" }}>
              <BrandLogo variant="footer" />
            </p>
            <p className="muted">
              Персонализирани подаръци и украси с гравиране — по готов модел
              или ваш дизайн, с доставка в цяла България.
            </p>
            <div className="footer-contact">
              <p>
                <span className="footer-contact-label">Адрес</span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {address}
                </a>
              </p>
              <p>
                <span className="footer-contact-label">Телефон</span>
                <a href={phoneHref}>{phone}</a>
              </p>
            </div>
            {facebookPageUrl ? (
              <p style={{ marginTop: "0.75rem" }}>
                <a
                  href={facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook страница
                </a>
              </p>
            ) : null}
          </div>
          <div>
            <h3>Магазин</h3>
            <Link href="/#katalog">Каталог</Link>
            <Link href="/blog">Блог</Link>
            <Link href="/custom">Поръчка по дизайн</Link>
            <Link href="/cart">Количка</Link>
            <Link href="/account">Моите поръчки</Link>
          </div>
          <div>
            <h3>Популярни</h3>
            <div className="footer-cats">
              {featured.map((c) => (
                <Link key={c.id} href={categoryHref(c.id)}>
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
            <details className="footer-all-cats">
              <summary>Всички категории</summary>
              <div className="footer-all-cats-grid">
                {groups.map(({ group, categories }) => (
                  <div key={group.id}>
                    <p className="footer-group-label">{group.label}</p>
                    {categories.map((c) => (
                      <Link key={c.id} href={categoryHref(c.id)}>
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
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
