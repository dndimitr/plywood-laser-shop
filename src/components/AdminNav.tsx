"use client";

import { NavLink } from "@/components/NavLink";

export function AdminNav() {
  return (
    <nav className="admin-nav-links" aria-label="Админ меню">
      <NavLink href="/admin" exact>
        Табло
      </NavLink>
      <NavLink href="/admin/orders">Поръчки</NavLink>
      <NavLink href="/admin/today">Днес</NavLink>
      <NavLink href="/admin/customers">Клиенти</NavLink>
      <NavLink href="/admin/products">Продукти</NavLink>
      <span className="admin-nav-sep" aria-hidden>
        |
      </span>
      <NavLink href="/admin/reports">Справки</NavLink>
      <NavLink href="/admin/pricing">Цени</NavLink>
      <NavLink href="/admin/shipping">Доставка</NavLink>
      <NavLink href="/admin/marketing">Маркетинг</NavLink>
      <NavLink href="/admin/templates">Шаблони</NavLink>
      <span className="admin-nav-sep" aria-hidden>
        |
      </span>
      <NavLink href="/" exact>
        Магазин
      </NavLink>
    </nav>
  );
}
