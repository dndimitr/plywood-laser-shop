"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  designReviewLabel,
  machineStatusLabel,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/labels";

const statuses = Object.keys(orderStatusLabel);
const reviews = Object.keys(designReviewLabel);
const payments = Object.keys(paymentStatusLabel);
const machines = Object.keys(machineStatusLabel);

type Props = {
  orderId: string;
  currentStatus: string;
  currentDesignReview?: string;
  currentPaymentStatus?: string;
  currentMachineStatus?: string;
  currentAdminNotes?: string | null;
  currentDesignNote?: string | null;
  paidAt?: string | null;
  paymentMethod: string;
};

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentDesignReview = "NOT_REQUIRED",
  currentPaymentStatus = "PENDING",
  currentMachineStatus = "NONE",
  currentAdminNotes = "",
  currentDesignNote = "",
  paidAt,
  paymentMethod,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [designReview, setDesignReview] = useState(currentDesignReview);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [machineStatus, setMachineStatus] = useState(currentMachineStatus);
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? "");
  const [designNote, setDesignNote] = useState(currentDesignNote ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Грешка");
  }

  async function save() {
    setPending(true);
    setError(null);
    try {
      await patch({
        status,
        designReview,
        paymentStatus,
        machineStatus,
        adminNotes,
        designReviewNote: designNote,
      });
      if (
        (designReview === "APPROVED" || designReview === "REJECTED") &&
        designReview !== currentDesignReview
      ) {
        const key =
          designReview === "APPROVED" ? "design_approved" : "design_rejected";
        await fetch(`/api/admin/orders/${orderId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, note: designNote }),
        });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  async function markPaid() {
    setPending(true);
    setError(null);
    try {
      await patch({
        paymentStatus: "PAID",
        paidAt: new Date().toISOString(),
      });
      setPaymentStatus("PAID");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>Обработка</h3>
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
        <span>Машина / производство</span>
        <select
          value={machineStatus}
          onChange={(e) => setMachineStatus(e.target.value)}
        >
          {machines.map((value) => (
            <option key={value} value={value}>
              {machineStatusLabel[value]}
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
        <span>Бележка към клиента за макета</span>
        <textarea
          rows={3}
          value={designNote}
          onChange={(e) => setDesignNote(e.target.value)}
        />
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
      {paymentMethod === "BANK_TRANSFER" ? (
        <p className="muted">
          {paidAt
            ? `Отбелязан превод: ${new Date(paidAt).toLocaleString("bg-BG")}`
            : "Преводът още не е отбелязан."}
        </p>
      ) : null}
      {paymentMethod === "BANK_TRANSFER" && paymentStatus !== "PAID" ? (
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={markPaid}
        >
          Преводът влезе
        </button>
      ) : null}
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
        {pending ? "Запис…" : "Запази обработката"}
      </button>
    </div>
  );
}
