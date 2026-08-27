import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
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
      <header className="admin-top">
        <div className="container admin-nav">
          <Link href={session?.user ? "/admin" : "/admin/login"} className="brand">
            Studio Breza · Админ
          </Link>
          {session?.user ? (
            <div className="admin-nav-end">
              <AdminNav />
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
            </div>
          ) : null}
        </div>
      </header>
      <div className="container">{children}</div>
    </div>
  );
}
