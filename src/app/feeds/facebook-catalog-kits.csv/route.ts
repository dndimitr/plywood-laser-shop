import {
  buildFacebookCatalogRows,
  rowsToCsv,
} from "@/lib/facebook-catalog-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Gift kits CSV for a one-off upload in Meta Commerce Manager. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const download =
    url.searchParams.get("download") === "1" ||
    url.searchParams.get("download") === "true";

  const rows = await buildFacebookCatalogRows({ kitsOnly: true });
  const body = rowsToCsv(rows);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="studio-breza-facebook-kits.csv"`,
      "Cache-Control": download
        ? "no-store"
        : "public, s-maxage=600, stale-while-revalidate=3600",
      "X-Catalog-Item-Count": String(rows.length),
    },
  });
}
