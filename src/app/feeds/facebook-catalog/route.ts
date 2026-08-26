import {
  buildFacebookCatalogRows,
  rowsToCsv,
  rowsToTsv,
  rowsToXml,
} from "@/lib/facebook-catalog-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Format = "csv" | "tsv" | "xml";

function resolveFormat(request: Request, fallback: Format): Format {
  const url = new URL(request.url);
  const q = url.searchParams.get("format")?.toLowerCase();
  if (q === "tsv" || q === "csv" || q === "xml") return q;
  return fallback;
}

async function feedResponse(request: Request, format: Format) {
  const url = new URL(request.url);
  const download =
    url.searchParams.get("download") === "1" ||
    url.searchParams.get("download") === "true";

  const rows = await buildFacebookCatalogRows();
  const body =
    format === "xml"
      ? rowsToXml(rows)
      : format === "tsv"
        ? rowsToTsv(rows)
        : rowsToCsv(rows);
  const filename =
    format === "xml"
      ? "studio-breza-facebook-catalog.xml"
      : format === "tsv"
        ? "studio-breza-facebook-catalog.tsv"
        : "studio-breza-facebook-catalog.csv";
  const contentType =
    format === "xml"
      ? "application/xml; charset=utf-8"
      : format === "tsv"
        ? "text/tab-separated-values; charset=utf-8"
        : "text/csv; charset=utf-8";

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": download
        ? "no-store"
        : "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Catalog-Item-Count": String(rows.length),
    },
  });
}

/** Meta Commerce Manager feed — CSV default; ?format=tsv|xml; ?download=1 */
export async function GET(request: Request) {
  return feedResponse(request, resolveFormat(request, "csv"));
}
