"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { orderId: string; itemId: string; title: string };

export function AdminItemFileUpload({ orderId, itemId, title }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("itemId", itemId);
      const res = await fetch(`/api/admin/orders/${orderId}/file`, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Грешка");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
      e.target.value = "";
    }
  }

  return (
    <label className="field">
      <span>Производствен файл за {title}</span>
      <input type="file" disabled={pending} onChange={onChange} />
      {pending ? <span className="muted">Качване…</span> : null}
      {error ? <p className="error">{error}</p> : null}
    </label>
  );
}
