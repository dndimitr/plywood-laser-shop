import { absoluteUrl } from "@/lib/seo";
import { buildFacebookCatalogRows } from "@/lib/facebook-catalog-feed";

/** Admin card: download / scheduled-fetch links for Meta Commerce catalog. */
export async function FacebookCatalogExportCard() {
  const rows = await buildFacebookCatalogRows();
  const xmlUrl = absoluteUrl("/feeds/facebook-catalog.xml");
  const csvUrl = absoluteUrl("/feeds/facebook-catalog.csv");
  const downloadXml = absoluteUrl("/feeds/facebook-catalog.xml?download=1");
  const downloadCsv = absoluteUrl("/feeds/facebook-catalog.csv?download=1");

  return (
    <section className="admin-card" style={{ marginBottom: "1.25rem" }}>
      <h2 className="marketing-form-heading" style={{ marginTop: 0 }}>
        Facebook продуктов каталог
      </h2>
      <p className="muted" style={{ marginBottom: "0.75rem" }}>
        Експорт на {rows.length} активни продукта. Задайте scheduled fetch в
        Meta Commerce Manager към XML линка — Facebook дърпа данните
        автоматично. Полето <code>id</code> е slug на продукта и трябва да
        съвпада с Pixel <code>content_ids</code> (ViewContent / AddToCart /
        Purchase).
      </p>
      <div
        className="admin-actions"
        style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}
      >
        <a className="btn btn-primary" href={xmlUrl} target="_blank" rel="noreferrer">
          XML feed URL
        </a>
        <a className="btn btn-ghost" href={downloadXml}>
          Изтегли XML
        </a>
        <a className="btn btn-ghost" href={downloadCsv}>
          Изтегли CSV
        </a>
        <a className="btn btn-ghost" href={csvUrl} target="_blank" rel="noreferrer">
          CSV feed
        </a>
      </div>
      <p className="muted" style={{ marginTop: "0.85rem", fontSize: "0.9rem" }}>
        Scheduled fetch (препоръчано): <code>{xmlUrl}</code>
      </p>
    </section>
  );
}
