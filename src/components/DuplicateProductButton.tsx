"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DuplicateProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function duplicate() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/duplicate`, {
        method: "POST",
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Грешка");
      router.push(`/admin/products/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={pending}
        onClick={duplicate}
      >
        {pending ? "Копиране…" : "Дублирай продукта"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </>
  );
}
