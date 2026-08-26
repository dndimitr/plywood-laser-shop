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

async function feedResponse(request: Request, format: Format) {
  const url = new URL(request.url);
  const download =
    url.searchParams.get("download") === "1" ||
    url.searchParams.get("download") === "true";

  const rows = await buildFacebookCatalogRows();
  const body = format === "tsv" ? rowsToTsv(rows) : rowsToCsv(rows);
  const filename =
    format === "tsv"
      ? "studio-breza-facebook-catalog.tsv"
      : "studio-breza-facebook-catalog.csv";
  const contentType =
    format === "tsv"
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

/** Meta Commerce Manager scheduled fetch — CSV (default) or ?format=tsv; ?download=1 to save file */
export async function GET(request: Request) {
  return feedResponse(request, resolveFormat(request, "csv"));
}
