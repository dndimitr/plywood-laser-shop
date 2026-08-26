"use client";

import { useEffect, useState } from "react";
import { IconShare } from "@/components/Icons";
import { facebookShareUrl } from "@/lib/seo-client";

type Props = {
  url: string;
  title?: string;
  pageUrl?: string | null;
};

/**
 * Споделяне на продукт като Facebook пост (Open Graph preview).
 * Отваря Facebook sharer — изберете страницата си, за да публикувате там.
 * Prefer the URL the visitor is viewing (custom domain) over a stale env host.
 */
export function FacebookShareButton({ url, title, pageUrl }: Props) {
  const [href, setHref] = useState(() => facebookShareUrl(url));

  useEffect(() => {
    const live = window.location.href.split("#")[0]?.split("?")[0];
    if (live?.startsWith("http")) {
      setHref(facebookShareUrl(live));
    } else {
      setHref(facebookShareUrl(url));
    }
  }, [url]);

  return (
    <div className="fb-share">
      <a
        className="btn btn-ghost fb-share-btn"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          title ? `Сподели „${title}“ във Facebook` : "Сподели във Facebook"
        }
      >
        <IconShare size={18} aria-hidden />
        Сподели във Facebook
      </a>
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
