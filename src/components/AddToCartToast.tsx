"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddToCartToast({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <p className="cart-toast-text">Добавено в количката</p>
      <div className="cart-toast-actions">
        <Link href="/cart" className="btn btn-primary btn-sm">
          Към количката
        </Link>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Продължи
        </button>
      </div>
    </div>
  );
}
