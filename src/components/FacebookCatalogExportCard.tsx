import { absoluteUrl } from "@/lib/seo";
import { buildFacebookCatalogRows } from "@/lib/facebook-catalog-feed";

/** Admin card: download / scheduled-fetch links for Meta Commerce catalog. */
export async function FacebookCatalogExportCard() {
  const rows = await buildFacebookCatalogRows();
  const csvUrl = absoluteUrl("/feeds/facebook-catalog.csv");
  const downloadUrl = absoluteUrl("/feeds/facebook-catalog.csv?download=1");
  const tsvUrl = absoluteUrl("/feeds/facebook-catalog.tsv");

  return (
    <section className="admin-card" style={{ marginBottom: "1.25rem" }}>
      <h2 className="marketing-form-heading" style={{ marginTop: 0 }}>
        Facebook продуктов каталог
      </h2>
      <p className="muted" style={{ marginBottom: "0.75rem" }}>
        Експорт на {rows.length} активни продукта във формат за Meta Commerce
        Manager (CSV/TSV). Може да качите файла ръчно или да зададете scheduled
        fetch към публичния URL.
      </p>
      <div className="admin-actions" style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
        <a className="btn btn-primary" href={downloadUrl}>
          Изтегли CSV ({rows.length})
        </a>
        <a className="btn btn-ghost" href={tsvUrl} target="_blank" rel="noreferrer">
          TSV
        </a>
        <a className="btn btn-ghost" href={csvUrl} target="_blank" rel="noreferrer">
          Отвори feed URL
        </a>
      </div>
      <p className="muted" style={{ marginTop: "0.85rem", fontSize: "0.9rem" }}>
        Scheduled fetch: <code>{csvUrl}</code>
      </p>
    </section>
  );
}
