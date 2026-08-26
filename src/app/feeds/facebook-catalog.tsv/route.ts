import {
  buildFacebookCatalogRows,
  rowsToTsv,
} from "@/lib/facebook-catalog-feed";

export const dynamic = "force-dynamic";

/** Pretty URL for Commerce Manager: /feeds/facebook-catalog.tsv */
export async function GET() {
  const rows = await buildFacebookCatalogRows();
  const body = rowsToTsv(rows);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Content-Disposition": 'inline; filename="facebook-catalog.tsv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Catalog-Item-Count": String(rows.length),
    },
  });
}
