"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { categoryHref } from "@/lib/occasions";
import { navCategoryGroups } from "@/lib/shop-config";

type Props = {
  cartCount: number;
};

export function MobileNav({ cartCount }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const titleId = useId();
  const groups = navCategoryGroups();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Затвори меню" : "Отвори меню"}</span>
        <span className={`menu-toggle-bars${open ? " is-open" : ""}`} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        className={`mobile-drawer-backdrop${open ? " is-open" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <nav
        id="mobile-drawer"
        className={`mobile-drawer${open ? " is-open" : ""}`}
        aria-labelledby={titleId}
        aria-hidden={!open}
      >
        <div className="mobile-drawer-head">
          <p id={titleId} className="mobile-drawer-title">
            Меню
          </p>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setOpen(false)}
          >
            Затвори
          </button>
        </div>

        <div className="mobile-drawer-body">
          <div className="mobile-drawer-links">
            <Link href="/#katalog" onClick={() => setOpen(false)}>
              Каталог
            </Link>
            <Link href="/#kak-raboti" onClick={() => setOpen(false)}>
              Как работи
            </Link>
            <Link href="/idei" onClick={() => setOpen(false)}>
              Идеи за подаръци
            </Link>
            <Link href="/custom" onClick={() => setOpen(false)}>
              Поръчка по дизайн
            </Link>
            <Link href="/account" onClick={() => setOpen(false)}>
              Моите поръчки
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)}>
              Количка{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </div>

          <div className="mobile-drawer-section">
            <p className="mobile-drawer-label">Категории</p>
            <Link
              href="/#katalog"
              className="mobile-drawer-all"
              onClick={() => setOpen(false)}
            >
              Всички категории
            </Link>
            {groups.map(({ group, categories }) => (
              <div key={group.id} className="mobile-drawer-group">
                <p className="mobile-drawer-group-title">{group.label}</p>
                <div className="mobile-drawer-cats">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={categoryHref(c.id)}
                      onClick={() => setOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mobile-drawer-locale">
            <LocaleSwitch />
          </div>
        </div>
      </nav>
    </div>
  );
}
