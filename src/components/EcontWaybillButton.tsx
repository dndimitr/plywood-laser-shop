"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  configured: boolean;
  shipmentNumber?: string | null;
  pdfUrl?: string | null;
  trackingUrl?: string | null;
};

export function EcontWaybillButton({
  orderId,
  configured,
  shipmentNumber,
  pdfUrl,
  trackingUrl,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function create() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/econt`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Грешка");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  async function refreshStatus() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/econt/status`);
      const data = (await res.json()) as { error?: string; status?: string };
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Грешка");
      }
      setStatus(data.status ?? "OK");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>Еконт товарителница</h3>
      {shipmentNumber ? (
        <>
          <p>
            Номер: <strong>{shipmentNumber}</strong>
          </p>
          {trackingUrl ? (
            <p>
              <a href={trackingUrl} target="_blank" rel="noreferrer">
                Проследяване
              </a>
            </p>
          ) : null}
          {pdfUrl ? (
            <p>
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                Отвори PDF за печат
              </a>
            </p>
          ) : (
            <p className="muted">PDF линкът не е върнат от Еконт.</p>
          )}
          {status ? <p>Статус: {status}</p> : null}
          <button
            type="button"
            className="btn btn-ghost"
            disabled={pending}
            onClick={refreshStatus}
          >
            {pending ? "Проверка…" : "Обнови статус"}
          </button>
        </>
      ) : (
        <>
          <p className="muted" style={{ marginTop: 0 }}>
            Създайте товарителница, когато пратката е готова за изпращане.
          </p>
          {!configured ? (
            <p className="muted">
              Еконт не е конфигуриран. Добавете ECONT_PRIVATE_KEY от
              delivery.econt.com в средата.
            </p>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending || !configured}
            onClick={create}
          >
            {pending ? "Създаване…" : "Създай товарителница"}
          </button>
        </>
      )}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
