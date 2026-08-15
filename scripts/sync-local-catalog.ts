import { ensureLocalDb, isLocalDbMode, readLocalDb } from "../src/lib/local-store";

async function main() {
  console.log("localMode", isLocalDbMode());
  const before = readLocalDb();
  console.log(
    "db before",
    before.products.length,
    "personalized",
    before.products.filter((p) => p.category === "personalized").length,
  );
  const db = await ensureLocalDb();
  console.log(
    "db after",
    db.products.length,
    "personalized",
    db.products.filter((p) => p.category === "personalized").length,
  );
  const sample = db.products.find((p) => p.slug === "klyuchodarzhatel-ime");
  console.log("keychain price", sample?.basePrice);
  const star = db.products.find((p) => p.slug === "personal-zvezdna-karta");
  console.log("star map", star?.name, star?.basePrice, star?.category);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
