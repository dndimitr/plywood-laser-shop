"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCart } from "@/components/Icons";
import { calculateTemplatePrice, formatBgn } from "@/lib/pricing";
import { laserTypeLabel } from "@/lib/labels";

type Option = {
  id: string;
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: string;
  priceModifier: number | string;
  material?: string;
  finish?: string;
  doubleSided?: boolean;
  materialLabel?: string;
  finishLabel?: string;
};

type Props = {
  productId: string;
  productName: string;
  basePrice: number;
  options: Option[];
};

export function ProductConfigurator({
  productId,
  productName,
  basePrice,
  options,
}: Props) {
  const router = useRouter();
  const [optionId, setOptionId] = useState(options[0]?.id ?? "");
  const [engravingText, setEngravingText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rush, setRush] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.id === optionId) ?? options[0],
    [optionId, options],
  );

  const lineTotal = selected
    ? calculateTemplatePrice(
        basePrice,
        Number(selected.priceModifier),
        quantity,
        {
          rush,
          rushMultiplier: 1.5,
          doubleSided: Boolean(selected.doubleSided),
          quantityDiscounts: [
            { minQty: 5, percentOff: 5 },
            { minQty: 10, percentOff: 10 },
            { minQty: 25, percentOff: 15 },
          ],
        },
      )
    : basePrice;

  async function addToCart() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_template",
          productId,
          optionId: selected?.id,
          engravingText,
          quantity,
          rush,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = data?.error;
        const message =
          (typeof err === "string" && err) ||
          err?.formErrors?.[0] ||
          err?.fieldErrors?.optionId?.[0] ||
          err?.fieldErrors?.productId?.[0] ||
          "Грешка при добавяне";
        throw new Error(message);
      }
      router.push("/cart");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  if (!selected) {
    return <p>Няма налични опции за този продукт.</p>;
  }

  return (
    <>
      <div className="configurator">
        <h2>Конфигурация</h2>
        <p className="muted configurator-product-name">{productName}</p>

        <label className="field">
          <span>Вариант (размер / материал / обработка)</span>
          <select
            value={optionId}
            onChange={(e) => setOptionId(e.target.value)}
            aria-label="Вариант на продукта"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label} (+{formatBgn(Number(o.priceModifier))})
              </option>
            ))}
          </select>
        </label>

        <div className="option-meta" aria-live="polite">
          <span>Размер: {selected.sizeLabel}</span>
          <span>Дебелина: {selected.thicknessMm} мм</span>
          <span>{laserTypeLabel[selected.laserType] ?? selected.laserType}</span>
          <span>Материал: {selected.materialLabel ?? selected.material}</span>
          <span>Финиш: {selected.finishLabel ?? selected.finish}</span>
          {selected.doubleSided ? <span>Двустранно</span> : null}
        </div>

        <label className="field">
          <span>Текст за гравиране</span>
          <input
            value={engravingText}
            onChange={(e) => setEngravingText(e.target.value)}
            placeholder="Име, инициали, кратко послание…"
            maxLength={200}
          />
        </label>

        <div className="field">
          <span>Количество</span>
          <div className="qty-control">
            <button
              type="button"
              aria-label="Намали количество"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
              }
              aria-label="Количество"
            />
            <button
              type="button"
              aria-label="Увеличи количество"
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            >
              +
            </button>
          </div>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            Отстъпка: 5+ бр. −5%, 10+ −10%, 25+ −15%
          </span>
        </div>

        <label className="radio">
          <input
            type="checkbox"
            checked={rush}
            onChange={(e) => setRush(e.target.checked)}
          />
          Ускорена изработка (+50%)
        </label>

        <p className="price-line desktop-price-line" aria-live="polite">
          Цена: <strong>{formatBgn(lineTotal)}</strong>
        </p>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="btn btn-primary configurator-submit"
          disabled={pending}
          onClick={addToCart}
        >
          <IconCart size={18} aria-hidden />
          {pending ? "Добавяне…" : "Добави в количката"}
        </button>
      </div>

      <div className="product-mobile-cta" aria-label="Добавяне в количката">
        {error ? (
          <p className="error product-mobile-cta-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="product-mobile-cta-row">
          <div className="product-mobile-cta-price">
            <span className="muted">Общо</span>
            <strong>{formatBgn(lineTotal)}</strong>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={addToCart}
          >
            <IconCart size={18} aria-hidden />
            {pending ? "…" : "Добави"}
          </button>
        </div>
      </div>
    </>
  );
}
