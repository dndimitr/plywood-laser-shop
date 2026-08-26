import {
  buildSitemapEntries,
  entriesToSitemapXml,
} from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * Explicit sitemap.xml route for Google Search Console.
 * Hand-rolled XML + charset + cache avoids Next metadata sitemap fetch issues.
 */
export async function GET() {
  const entries = await buildSitemapEntries();
  const xml = entriesToSitemapXml(entries);

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Sitemap-Url-Count": String(entries.length),
    },
  });
}
