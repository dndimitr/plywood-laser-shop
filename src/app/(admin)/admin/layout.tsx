import type { Metadata } from "next";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Админ",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="admin-shell">
      <div className="container admin-nav">
        <Link href="/admin" className="brand">
          Админ
        </Link>
        {session?.user ? (
          <nav className="nav">
            <Link href="/admin/orders">Поръчки</Link>
            <Link href="/admin/products">Продукти</Link>
            <Link href="/admin/pricing">Цени</Link>
            <Link href="/admin/shipping">Доставка</Link>
            <Link href="/">Магазин</Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button type="submit" className="btn btn-ghost">
                Изход
              </button>
            </form>
          </nav>
        ) : null}
      </div>
      <div className="container">{children}</div>
    </div>
  );
}
