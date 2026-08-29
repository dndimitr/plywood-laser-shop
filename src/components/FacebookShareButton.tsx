"use client";

import { useEffect, useState } from "react";
import { IconShare } from "@/components/Icons";
import { facebookShareUrl, isMobileShareDevice } from "@/lib/seo-client";

type Props = {
  url: string;
  title?: string;
  pageUrl?: string | null;
};

function canonicalPageUrl(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const live = window.location.href.split("#")[0]?.split("?")[0];
  return live?.startsWith("http") ? live : fallback;
}

/**
 * Mobile: OS share sheet (Facebook app gets title + URL).
 * Desktop: Facebook sharer.php.
 * iOS/Android intercept sharer.php via Universal Links and drop `u=` —
 * the app opens with an empty composer.
 */
export function FacebookShareButton({ url, title, pageUrl }: Props) {
  const [shareUrl, setShareUrl] = useState(url);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(canonicalPageUrl(url));
  }, [url]);

  async function onShare() {
    setCopied(false);
    const href = canonicalPageUrl(url);
    const shareTitle = title?.trim() || "Studio Breza";
    const shareText = title?.trim()
      ? `${title.trim()} — персонализиран подарък от Studio Breza`
      : "Персонализирани подаръци от Studio Breza";
    const payload: ShareData = {
      title: shareTitle,
      text: shareText,
      url: href,
    };

    if (isMobileShareDevice() && typeof navigator.share === "function") {
      try {
        if (!navigator.canShare || navigator.canShare(payload)) {
          await navigator.share(payload);
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    if (!isMobileShareDevice()) {
      const sharer = facebookShareUrl(href, shareText);
      const opened = window.open(sharer, "_blank", "noopener,noreferrer");
      if (!opened) window.location.assign(sharer);
      return;
    }

    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
    } catch {
      window.prompt("Копирайте линка и го поставете във Facebook:", href);
    }
  }

  return (
    <div className="fb-share">
      <button
        type="button"
        className="btn btn-ghost fb-share-btn"
        onClick={() => void onShare()}
        aria-label={
          title ? `Сподели „${title}“` : "Сподели продукта"
        }
      >
        <IconShare size={18} aria-hidden />
        Сподели
      </button>
      {copied ? (
        <p className="fb-share-copied" role="status">
          Линкът е копиран. Отворете Facebook и го поставете в нов пост — ще се
          появи снимката и заглавието.
        </p>
      ) : null}
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
