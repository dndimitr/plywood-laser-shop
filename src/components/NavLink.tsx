"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  /** Match only the exact path (ignore nested routes). */
  exact?: boolean;
};

function pathOf(href: ComponentProps<typeof Link>["href"]) {
  const raw = typeof href === "string" ? href : href.pathname ?? "";
  return raw.split("#")[0] || "/";
}

export function isNavActive(
  pathname: string,
  href: ComponentProps<typeof Link>["href"],
  exact = false,
) {
  const path = pathOf(href);
  if (path === "/") return pathname === "/";
  if (exact) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function NavLink({ exact, className, href, ...rest }: Props) {
  const pathname = usePathname();
  const hashOnly = typeof href === "string" && href.includes("#");
  const active = !hashOnly && isNavActive(pathname, href, exact);

  return (
    <Link
      href={href}
      {...rest}
      className={className}
      aria-current={active ? "page" : undefined}
    />
  );
}
