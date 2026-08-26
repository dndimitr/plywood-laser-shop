import {
  buildFacebookCatalogRows,
  rowsToCsv,
  rowsToTsv,
} from "@/lib/facebook-catalog-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Format = "csv" | "tsv";

function resolveFormat(request: Request, fallback: Format): Format {
  const url = new URL(request.url);
  const q = url.searchParams.get("format")?.toLowerCase();
  if (q === "tsv" || q === "csv") return q;
  return fallback;
}

async function feedResponse(format: Format) {
  const rows = await buildFacebookCatalogRows();
  const body = format === "tsv" ? rowsToTsv(rows) : rowsToCsv(rows);
  const filename =
    format === "tsv" ? "facebook-catalog.tsv" : "facebook-catalog.csv";
  const contentType =
    format === "tsv"
      ? "text/tab-separated-values; charset=utf-8"
      : "text/csv; charset=utf-8";

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Catalog-Item-Count": String(rows.length),
    },
  });
}

/** Meta Commerce Manager scheduled fetch — CSV (default) or ?format=tsv */
export async function GET(request: Request) {
  return feedResponse(resolveFormat(request, "csv"));
}
