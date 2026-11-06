import "server-only";
import type { DatabaseSync } from "node:sqlite";
import seedData from "./seed-data.json";
import { DEFAULT_BUSINESS, DEFAULT_SEO } from "../defaults";
import { hashPasswordSync } from "../services/password";

const count = (db: DatabaseSync, table: string) =>
  (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;

/** Idempotent first-boot seed. Runs inside the migration transaction. */
export function seed(db: DatabaseSync) {
  if (count(db, "settings") === 0) {
    const put = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    put.run("business", JSON.stringify(DEFAULT_BUSINESS));
    put.run("seo", JSON.stringify(DEFAULT_SEO));
  }

  if (count(db, "products") === 0) {
    const ins = db.prepare(
      `INSERT INTO products (slug, name, tagline, description, hero_image, swatch_image, sort_order, published, content)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const p of seedData.products) {
      ins.run(p.slug, p.name, p.tagline, p.description, p.heroImage, p.swatchImage, p.sortOrder, p.published ? 1 : 0, JSON.stringify(p.content));
    }
  }

  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
  if (count(db, "users") === 0 && email && password) {
    db.prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)").run(email, "Administrator", hashPasswordSync(password));
  }
}
