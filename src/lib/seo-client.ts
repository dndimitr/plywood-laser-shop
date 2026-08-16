/** Client-safe marketing helpers (no Node fs / DB imports). */

export const CONSENT_STORAGE_KEY = "lsp_cookie_consent_v1";
export type ConsentChoice = "accepted" | "rejected";

/** Facebook sharer URL for posting a product link. */
export function facebookShareUrl(productAbsoluteUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productAbsoluteUrl)}`;
}
