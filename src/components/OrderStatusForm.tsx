"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { designReviewLabel, orderStatusLabel, paymentStatusLabel } from "@/lib/labels";

const statuses = Object.keys(orderStatusLabel);
const reviews = Object.keys(designReviewLabel);
const payments = Object.keys(paymentStatusLabel);

type Props = {
  orderId: string;
  currentStatus: string;
  currentDesignReview?: string;
  currentPaymentStatus?: string;
  currentAdminNotes?: string | null;
};

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentDesignReview = "NOT_REQUIRED",
  currentPaymentStatus = "PENDING",
  currentAdminNotes = "",
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [designReview, setDesignReview] = useState(currentDesignReview);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          designReview,
          paymentStatus,
          adminNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Грешка");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <label className="field">
        <span>Статус</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Преглед на макет</span>
        <select
          value={designReview}
          onChange={(e) => setDesignReview(e.target.value)}
        >
          {reviews.map((value) => (
            <option key={value} value={value}>
              {designReviewLabel[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Плащане</span>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          {payments.map((value) => (
            <option key={value} value={value}>
              {paymentStatusLabel[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Админ бележки</span>
        <textarea
          rows={4}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button
        type="button"
        className="btn btn-primary"
        disabled={pending}
        onClick={save}
      >
        {pending ? "Запис…" : "Запази"}
      </button>
    </div>
  );
}
