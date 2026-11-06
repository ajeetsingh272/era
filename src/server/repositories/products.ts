import "server-only";
import { getDb } from "../db";
import type { Product, ProductContent, ProductInput } from "@/types";

interface Row {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hero_image: string;
  swatch_image: string;
  sort_order: number;
  published: number;
  content: string;
  updated_at: string;
}

const toProduct = (r: Row): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  tagline: r.tagline,
  description: r.description,
  heroImage: r.hero_image,
  swatchImage: r.swatch_image,
  sortOrder: r.sort_order,
  published: r.published === 1,
  content: JSON.parse(r.content) as ProductContent,
  updatedAt: r.updated_at,
});

const params = (p: ProductInput) => [
  p.slug, p.name, p.tagline, p.description, p.heroImage, p.swatchImage, p.sortOrder, p.published ? 1 : 0, JSON.stringify(p.content),
] as const;

export const productsRepo = {
  list({ includeDrafts = false } = {}): Product[] {
    const sql = `SELECT * FROM products ${includeDrafts ? "" : "WHERE published = 1"} ORDER BY sort_order, id`;
    return (getDb().prepare(sql).all() as unknown as Row[]).map(toProduct);
  },

  getBySlug(slug: string, { includeDrafts = false } = {}): Product | null {
    const row = getDb()
      .prepare(`SELECT * FROM products WHERE slug = ? ${includeDrafts ? "" : "AND published = 1"}`)
      .get(slug) as Row | undefined;
    return row ? toProduct(row) : null;
  },

  getById(id: number): Product | null {
    const row = getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as Row | undefined;
    return row ? toProduct(row) : null;
  },

  slugTaken(slug: string, exceptId?: number): boolean {
    return !!getDb().prepare("SELECT 1 FROM products WHERE slug = ? AND id != ?").get(slug, exceptId ?? -1);
  },

  create(p: ProductInput): number {
    const res = getDb()
      .prepare(
        `INSERT INTO products (slug, name, tagline, description, hero_image, swatch_image, sort_order, published, content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(...params(p));
    return Number(res.lastInsertRowid);
  },

  update(id: number, p: ProductInput) {
    getDb()
      .prepare(
        `UPDATE products SET slug = ?, name = ?, tagline = ?, description = ?, hero_image = ?, swatch_image = ?,
           sort_order = ?, published = ?, content = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .run(...params(p), id);
  },

  delete(id: number) {
    getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  },

  count(): number {
    return (getDb().prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number }).n;
  },
};
