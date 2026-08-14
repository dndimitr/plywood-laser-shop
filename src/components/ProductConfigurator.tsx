"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AddToCartToast } from "@/components/AddToCartToast";
import { IconCart } from "@/components/Icons";
import { calculateTemplatePrice, formatBgn } from "@/lib/pricing";
import { laserTypeLabel } from "@/lib/labels";
import {
  MAX_LINE_QTY,
  PRODUCTION_LEAD,
  QUOTE_QTY_THRESHOLD,
} from "@/lib/shop-config";

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
  productSlug?: string;
  basePrice: number;
  options: Option[];
};

export function ProductConfigurator({
  productId,
  productName,
  productSlug,
  basePrice,
  options,
}: Props) {
  const router = useRouter();
  const [optionId, setOptionId] = useState(options[0]?.id ?? "");
  const [engravingText, setEngravingText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const closeToast = useCallback(() => setToastOpen(false), []);
  const previousSizeRef = useRef<string | null>(null);
  const [sizeChange, setSizeChange] = useState<string | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.id === optionId) ?? options[0],
    [optionId, options],
  );

  useEffect(() => {
    const next = selected?.sizeLabel;
    if (!next) return;
    const prev = previousSizeRef.current;
    if (prev && prev !== next) {
      setSizeChange(`от ${prev} → ${next}`);
    }
    previousSizeRef.current = next;
  }, [selected?.sizeLabel]);

  const lineTotal = selected
    ? calculateTemplatePrice(
        basePrice,
        Number(selected.priceModifier),
        quantity,
        {
          rush: false,
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
          rush: false,
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
      setToastOpen(true);
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

        <fieldset className="size-picker">
          <legend>Размер</legend>
          <div
            className="size-picker-grid"
            role="radiogroup"
            aria-label="Избор на размер"
          >
            {options.map((o) => {
              const unit = basePrice + Number(o.priceModifier);
              const active = o.id === selected.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`size-card${active ? " is-active" : ""}`}
                  onClick={() => setOptionId(o.id)}
                >
                  <span className="size-card-size">{o.sizeLabel}</span>
                  <span className="size-card-label">{o.label}</span>
                  <span className="size-card-price">{formatBgn(unit)}</span>
                </button>
              );
            })}
          </div>
          <p className="size-now" aria-live="polite">
            Избран размер: <strong>{selected.sizeLabel}</strong>
            {sizeChange ? (
              <span className="size-change"> · смяна {sizeChange}</span>
            ) : null}
          </p>
        </fieldset>

        <div className="option-meta" aria-live="polite">
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
              max={MAX_LINE_QTY}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(MAX_LINE_QTY, Number(e.target.value) || 1),
                  ),
                )
              }
              aria-label="Количество"
            />
            <button
              type="button"
              aria-label="Увеличи количество"
              onClick={() =>
                setQuantity((q) => Math.min(MAX_LINE_QTY, q + 1))
              }
            >
              +
            </button>
          </div>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            Отстъпка: 5+ бр. −5%, 10+ −10%, 25+ −15%. До {MAX_LINE_QTY} бр.
          </span>
          {quantity >= QUOTE_QTY_THRESHOLD ? (
            <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.35rem" }}>
              Над {QUOTE_QTY_THRESHOLD} бр. можете и да{" "}
              <Link href="/za-biznes#oferta">заявите оферта</Link>
              {productSlug ? ` за този модел` : ""}.
            </p>
          ) : null}
        </div>

        <p className="muted rush-hint" style={{ margin: "0.5rem 0" }}>
          Срок: {PRODUCTION_LEAD.standardLabel}. Ускорено (+
          {PRODUCTION_LEAD.rushSurchargePercent}%) се избира на стъпка
          „Поръчка“.
        </p>

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

      <AddToCartToast open={toastOpen} onClose={closeToast} />
    </>
  );
}
