/** Client-safe marketing helpers (no Node fs / DB imports). */

export const CONSENT_STORAGE_KEY = "lsp_cookie_consent_v1";
export type ConsentChoice = "accepted" | "rejected";

/** Facebook sharer URL for posting a product link (desktop / fallback). */
export function facebookShareUrl(
  productAbsoluteUrl: string,
  quote?: string,
): string {
  const params = new URLSearchParams({ u: productAbsoluteUrl });
  if (quote?.trim()) params.set("quote", quote.trim());
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

export function isMobileShareDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const ua = window.navigator.userAgent;
  return coarse || /iPhone|iPad|iPod|Android/i.test(ua);
}
