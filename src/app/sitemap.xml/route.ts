import {
  buildSitemapEntries,
  entriesToSitemapXml,
  staticSitemapEntries,
} from "@/lib/sitemap-data";

export const runtime = "nodejs";
export const revalidate = 3600;
export const maxDuration = 8;

function xmlResponse(xml: string, count: number) {
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "X-Sitemap-Url-Count": String(count),
    },
  });
}

/**
 * Explicit sitemap.xml for Google Search Console.
 * Always 200 + well-formed XML — a 500 here is stored by GSC for days.
 */
export async function GET() {
  try {
    const entries = await buildSitemapEntries();
    return xmlResponse(entriesToSitemapXml(entries), entries.length);
  } catch (err) {
    console.error("[sitemap] GET failed", err);
    const fallback = staticSitemapEntries();
    return xmlResponse(entriesToSitemapXml(fallback), fallback.length);
  }
}
