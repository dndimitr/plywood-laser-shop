import Link from "next/link";

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
