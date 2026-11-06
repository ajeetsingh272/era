import "server-only";
import { getDb } from "../db";
import type { CustomPage, CustomPageInput, PageSection } from "@/types";

interface Row {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  sections: string;
  show_in_menu: number;
  sort_order: number;
  published: number;
  updated_at: string;
}

const toPage = (r: Row): CustomPage => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  sections: JSON.parse(r.sections) as PageSection[],
  showInMenu: r.show_in_menu === 1,
  sortOrder: r.sort_order,
  published: r.published === 1,
  updatedAt: r.updated_at,
});

const params = (p: CustomPageInput) =>
  [p.slug, p.title, p.subtitle, JSON.stringify(p.sections), p.showInMenu ? 1 : 0, p.sortOrder, p.published ? 1 : 0] as const;

/** Admin-created content pages served at /<slug>. */
export const pagesRepo = {
  list({ includeDrafts = false } = {}): CustomPage[] {
    const sql = `SELECT * FROM pages ${includeDrafts ? "" : "WHERE published = 1"} ORDER BY sort_order, id`;
    return (getDb().prepare(sql).all() as unknown as Row[]).map(toPage);
  },

  getBySlug(slug: string, { includeDrafts = false } = {}): CustomPage | null {
    const row = getDb()
      .prepare(`SELECT * FROM pages WHERE slug = ? ${includeDrafts ? "" : "AND published = 1"}`)
      .get(slug) as Row | undefined;
    return row ? toPage(row) : null;
  },

  getById(id: number): CustomPage | null {
    const row = getDb().prepare("SELECT * FROM pages WHERE id = ?").get(id) as Row | undefined;
    return row ? toPage(row) : null;
  },

  slugTaken(slug: string, exceptId?: number): boolean {
    return !!getDb().prepare("SELECT 1 FROM pages WHERE slug = ? AND id != ?").get(slug, exceptId ?? -1);
  },

  create(p: CustomPageInput): number {
    const res = getDb()
      .prepare("INSERT INTO pages (slug, title, subtitle, sections, show_in_menu, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(...params(p));
    return Number(res.lastInsertRowid);
  },

  update(id: number, p: CustomPageInput) {
    getDb()
      .prepare(
        `UPDATE pages SET slug = ?, title = ?, subtitle = ?, sections = ?, show_in_menu = ?, sort_order = ?, published = ?,
           updated_at = datetime('now') WHERE id = ?`,
      )
      .run(...params(p), id);
  },

  delete(id: number) {
    getDb().prepare("DELETE FROM pages WHERE id = ?").run(id);
  },
};
