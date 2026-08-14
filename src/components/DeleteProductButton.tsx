"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { productId: string; productName: string };

export function DeleteProductButton({ productId, productName }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (
      !confirm(
        `Изтриване на „${productName}“? Това действие не може да се отмени.`,
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Грешка при изтриване",
        );
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ marginTop: "1.25rem" }}>
      {error ? <p className="error">{error}</p> : null}
      <button
        type="button"
        className="btn btn-ghost"
        style={{ color: "var(--error)" }}
        disabled={pending}
        onClick={remove}
      >
        {pending ? "Изтриване…" : "Изтрий продукт"}
      </button>
    </div>
  );
}
