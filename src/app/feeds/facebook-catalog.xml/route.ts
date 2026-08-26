import {
  buildFacebookCatalogRows,
  rowsToXml,
} from "@/lib/facebook-catalog-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Meta Commerce Manager XML catalog feed (RSS 2.0).
 * Scheduled fetch: https://studiobreza.eu/feeds/facebook-catalog.xml
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const download =
    url.searchParams.get("download") === "1" ||
    url.searchParams.get("download") === "true";

  const rows = await buildFacebookCatalogRows();
  const body = rowsToXml(rows);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="studio-breza-facebook-catalog.xml"`,
      "Cache-Control": download
        ? "no-store"
        : "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Catalog-Item-Count": String(rows.length),
    },
  });
}
