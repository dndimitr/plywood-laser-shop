import {
  buildFacebookCatalogRows,
  rowsToXml,
} from "@/lib/facebook-catalog-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Gift kits only — add as a second data source in Commerce Manager
 * or upload the CSV. Do not replace the main catalog URL (that would
 * drop the rest of the shop).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const download =
    url.searchParams.get("download") === "1" ||
    url.searchParams.get("download") === "true";

  const rows = await buildFacebookCatalogRows({ kitsOnly: true });
  const body = rowsToXml(rows);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="studio-breza-facebook-kits.xml"`,
      "Cache-Control": download
        ? "no-store"
        : "public, s-maxage=600, stale-while-revalidate=3600",
      "X-Catalog-Item-Count": String(rows.length),
    },
  });
}
