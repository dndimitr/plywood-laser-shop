import { writeFileSync } from "fs";
import {
  buildFacebookCatalogRows,
  rowsToCsv,
} from "../src/lib/facebook-catalog-feed";

async function main() {
  const rows = await buildFacebookCatalogRows();
  const csv = rowsToCsv(rows);
  console.log("count", rows.length);
  console.log(csv.split("\n").slice(0, 3).join("\n"));
  writeFileSync("/opt/cursor/artifacts/facebook-catalog.csv", csv);
  console.log("bytes", csv.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
