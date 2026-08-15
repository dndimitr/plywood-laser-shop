/** Client-safe marketing helpers (no Node fs / DB imports). */

export const CONSENT_STORAGE_KEY = "lsp_cookie_consent_v1";
export type ConsentChoice = "accepted" | "rejected";

/**
 * Facebook sharer URL that always includes the product link (`u=`).
 * Optional `quote` is shown as suggested text in the composer when supported.
 */
export function facebookShareUrl(
  productAbsoluteUrl: string,
  quote?: string,
): string {
  const params = new URLSearchParams();
  params.set("u", productAbsoluteUrl);
  if (quote?.trim()) params.set("quote", quote.trim());
  // display=popup helps desktop; mobile browsers still receive `u`.
  params.set("display", "popup");
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}
