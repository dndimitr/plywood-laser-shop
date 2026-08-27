"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminBatchEcont({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!ids.length) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/orders/econt-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = (await res.json()) as {
        error?: string;
        results?: Array<{ ok: boolean }>;
      };
      if (!res.ok) throw new Error(data.error ?? "Грешка");
      const ok = data.results?.filter((row) => row.ok).length ?? 0;
      setMessage(`Готови товарителници: ${ok} / ${ids.length}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={pending || ids.length === 0}
        onClick={run}
      >
        {pending ? "Създаване…" : `Еконт за ${ids.length} готови`}
      </button>
      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
