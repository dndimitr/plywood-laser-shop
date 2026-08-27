"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EcontDestinationFields } from "@/components/EcontDestinationFields";
import {
  courierLabel,
  paymentMethodLabel,
} from "@/lib/labels";
import { formatMoney, roundMoney } from "@/lib/pricing";
import type { EcontShippingDetails } from "@/lib/shipping-details";

type ItemDraft = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  sheetCount: number | null;
};

type Props = {
  orderId: string;
  hasWaybill: boolean;
  defaultFees: { ECONT: number; SPEEDY: number; PICKUP: number };
  initial: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    shippingNote: string;
    courier: "ECONT" | "SPEEDY" | "PICKUP";
    shippingFee: number;
    paymentMethod: "BANK_TRANSFER" | "CASH_ON_DELIVERY" | "CARD";
    rush: boolean;
    needInvoice: boolean;
    companyName: string;
    vatNumber: string;
    speedyShipmentNumber: string;
    trackingUrl: string;
    shippingDetails: EcontShippingDetails | null;
    items: ItemDraft[];
  };
};

export function AdminOrderEditForm({
  orderId,
  hasWaybill,
  defaultFees,
  initial,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const subtotal = useMemo(
    () =>
      roundMoney(
        form.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      ),
    [form.items],
  );
  const total = roundMoney(subtotal + Number(form.shippingFee || 0));

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateItem(id: string, patch: Partial<ItemDraft>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
    setSaved(false);
  }

  async function save() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          shippingAddress: form.shippingAddress,
          shippingDetails:
            form.courier === "ECONT" ? form.shippingDetails : null,
          shippingNote: form.shippingNote || null,
          courier: form.courier,
          shippingFee: Number(form.shippingFee),
          paymentMethod: form.paymentMethod,
          rush: form.rush,
          needInvoice: form.needInvoice,
          companyName: form.companyName || null,
          vatNumber: form.vatNumber || null,
          speedyShipmentNumber: form.speedyShipmentNumber || null,
          trackingUrl: form.trackingUrl || null,
          items: form.items.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            sheetCount: item.sheetCount,
          })),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Грешка");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>Данни на поръчката</h3>
      {hasWaybill ? (
        <p className="admin-warn">
          Има издадена товарителница. Смяна на адреса не я обновява
          автоматично.
        </p>
      ) : null}

      <div className="grid-2">
        <label className="field">
          <span>Име</span>
          <input
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Телефон</span>
          <input
            value={form.customerPhone}
            onChange={(e) => update("customerPhone", e.target.value)}
          />
        </label>
      </div>
      <label className="field">
        <span>Имейл</span>
        <input
          type="email"
          value={form.customerEmail}
          onChange={(e) => update("customerEmail", e.target.value)}
        />
      </label>

      <label className="field">
        <span>Куриер</span>
        <select
          value={form.courier}
          onChange={(e) => {
            const courier = e.target.value as typeof form.courier;
            update("courier", courier);
            setForm((prev) => ({
              ...prev,
              courier,
              shippingFee: defaultFees[courier],
            }));
          }}
        >
          {Object.entries(courierLabel).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {form.courier === "ECONT" ? (
        <EcontDestinationFields
          value={form.shippingDetails}
          onChange={(value) => update("shippingDetails", value)}
        />
      ) : (
        <label className="field">
          <span>Адрес / офис</span>
          <textarea
            rows={3}
            value={form.shippingAddress}
            onChange={(e) => update("shippingAddress", e.target.value)}
          />
        </label>
      )}
      {form.courier === "ECONT" && !form.shippingDetails ? (
        <label className="field">
          <span>Адрес (стар свободен текст)</span>
          <textarea
            rows={2}
            value={form.shippingAddress}
            onChange={(e) => update("shippingAddress", e.target.value)}
          />
        </label>
      ) : null}

      <label className="field">
        <span>Бележка към куриера</span>
        <input
          value={form.shippingNote}
          onChange={(e) => update("shippingNote", e.target.value)}
        />
      </label>
      <div className="grid-2">
        <label className="field">
          <span>Такса доставка €</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.shippingFee}
            onChange={(e) => update("shippingFee", Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>Плащане</span>
          <select
            value={form.paymentMethod}
            onChange={(e) =>
              update(
                "paymentMethod",
                e.target.value as typeof form.paymentMethod,
              )
            }
          >
            {Object.entries(paymentMethodLabel).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {form.courier === "SPEEDY" ? (
        <label className="field">
          <span>Номер Speedy</span>
          <input
            value={form.speedyShipmentNumber}
            onChange={(e) => update("speedyShipmentNumber", e.target.value)}
          />
        </label>
      ) : null}
      <label className="field">
        <span>Линк за проследяване</span>
        <input
          value={form.trackingUrl}
          onChange={(e) => update("trackingUrl", e.target.value)}
        />
      </label>
      <label className="field checkbox">
        <input
          type="checkbox"
          checked={form.rush}
          onChange={(e) => update("rush", e.target.checked)}
        />
        <span>Ускорена изработка</span>
      </label>
      <label className="field checkbox">
        <input
          type="checkbox"
          checked={form.needInvoice}
          onChange={(e) => update("needInvoice", e.target.checked)}
        />
        <span>Фактура</span>
      </label>
      {form.needInvoice ? (
        <div className="grid-2">
          <label className="field">
            <span>Фирма</span>
            <input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </label>
          <label className="field">
            <span>ЕИК / ДДС</span>
            <input
              value={form.vatNumber}
              onChange={(e) => update("vatNumber", e.target.value)}
            />
          </label>
        </div>
      ) : null}

      <h4>Артикули</h4>
      {form.items.map((item) => (
        <div key={item.id} className="admin-item-edit">
          <label className="field">
            <span>Име</span>
            <input
              value={item.title}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
            />
          </label>
          <div className="grid-3">
            <label className="field">
              <span>Брой</span>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(item.id, { quantity: Number(e.target.value) })
                }
              />
            </label>
            <label className="field">
              <span>Ед. цена €</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(item.id, { unitPrice: Number(e.target.value) })
                }
              />
            </label>
            <label className="field">
              <span>Плочи</span>
              <input
                type="number"
                min="0"
                value={item.sheetCount ?? ""}
                onChange={(e) =>
                  updateItem(item.id, {
                    sheetCount: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
        </div>
      ))}

      <p>
        Междинна {formatMoney(subtotal)} · Доставка {formatMoney(form.shippingFee)}{" "}
        · <strong>Общо {formatMoney(total)}</strong>
      </p>
      {error ? <p className="error">{error}</p> : null}
      {saved ? <p className="success-text">Записано</p> : null}
      <button
        type="button"
        className="btn btn-primary"
        disabled={pending}
        onClick={save}
      >
        {pending ? "Запис…" : "Запази данните"}
      </button>
    </div>
  );
}
