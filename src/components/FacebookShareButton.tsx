"use client";

import { useCallback, useState } from "react";
import { IconShare } from "@/components/Icons";
import { facebookShareUrl } from "@/lib/seo-client";

type Props = {
  /** Absolute product URL (preferred). Falls back to current page URL. */
  url: string;
  title?: string;
  pageUrl?: string | null;
};

function resolveShareUrl(preferred: string): string {
  if (preferred && /^https?:\/\//i.test(preferred)) return preferred;
  if (typeof window !== "undefined") {
    return window.location.href.split("#")[0] ?? window.location.href;
  }
  return preferred;
}

/**
 * Споделяне на продукт във Facebook с линк към продуктовата страница.
 * На мобилни ползва Web Share API (подава URL коректно към приложението);
 * иначе отваря Facebook sharer с u= параметър.
 */
export function FacebookShareButton({ url, title, pageUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const productUrl = resolveShareUrl(url);
    const shareTitle = title?.trim() || "Studio Breza";
    const shareText = title
      ? `${title} — персонализиран продукт от Studio Breza`
      : "Персонализиран продукт от Studio Breza";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: productUrl,
        });
        return;
      } catch (err) {
        // User cancelled — stop. Other errors fall through to Facebook sharer.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    const href = facebookShareUrl(productUrl, shareTitle);
    const popup = window.open(
      href,
      "fb-share",
      "noopener,noreferrer,width=640,height=720",
    );
    if (!popup) {
      window.location.assign(href);
    }
  }, [title, url]);

  const copyLink = useCallback(async () => {
    const productUrl = resolveShareUrl(url);
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Копирайте линка към продукта:", productUrl);
    }
  }, [url]);

  return (
    <div className="fb-share">
      <div className="fb-share-actions">
        <button
          type="button"
          className="btn btn-ghost fb-share-btn"
          onClick={() => void share()}
          aria-label={
            title ? `Сподели „${title}“ във Facebook` : "Сподели във Facebook"
          }
        >
          <IconShare size={18} aria-hidden />
          Сподели във Facebook
        </button>
        <button
          type="button"
          className="btn btn-ghost fb-copy-btn"
          onClick={() => void copyLink()}
        >
          {copied ? "Копирано" : "Копирай линка"}
        </button>
      </div>
      <p className="fb-share-hint muted">
        Споделянето включва линка към този продукт.
      </p>
      {pageUrl ? (
        <a
          className="fb-page-link muted"
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Към Facebook страницата
        </a>
      ) : null}
    </div>
  );
}
