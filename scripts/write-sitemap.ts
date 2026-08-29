import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  buildSitemapEntries,
  entriesToSitemapTxt,
  entriesToSitemapXml,
} from "../src/lib/sitemap-data";

async function main() {
  const entries = await buildSitemapEntries();
  const publicDir = join(process.cwd(), "public");
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(join(publicDir, "sitemap.xml"), entriesToSitemapXml(entries));
  writeFileSync(join(publicDir, "sitemap.txt"), entriesToSitemapTxt(entries));
  console.log(
    `Wrote public/sitemap.xml and public/sitemap.txt (${entries.length} URLs).`,
  );
}

main().catch((err) => {
  console.error("[write-sitemap]", err);
  process.exit(1);
});
