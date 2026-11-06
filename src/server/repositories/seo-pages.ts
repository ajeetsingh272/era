import "server-only";
import { getDb } from "../db";
import type { PageSeo, PageSeoInput } from "@/types";

interface Row {
  path: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string;
  canonical: string;
  noindex: number;
  updated_at: string;
}

const toPageSeo = (r: Row): PageSeo => ({
  path: r.path,
  title: r.title,
  description: r.description,
  keywords: r.keywords,
  ogImage: r.og_image,
  canonical: r.canonical,
  noindex: r.noindex === 1,
  updatedAt: r.updated_at,
});

export const seoPagesRepo = {
  get(path: string): PageSeo | null {
    const row = getDb().prepare("SELECT * FROM seo_pages WHERE path = ?").get(path) as Row | undefined;
    return row ? toPageSeo(row) : null;
  },

  list(): PageSeo[] {
    return (getDb().prepare("SELECT * FROM seo_pages ORDER BY path").all() as unknown as Row[]).map(toPageSeo);
  },

  upsert(s: PageSeoInput) {
    getDb()
      .prepare(
        `INSERT INTO seo_pages (path, title, description, keywords, og_image, canonical, noindex, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(path) DO UPDATE SET title = excluded.title, description = excluded.description,
           keywords = excluded.keywords, og_image = excluded.og_image, canonical = excluded.canonical,
           noindex = excluded.noindex, updated_at = excluded.updated_at`,
      )
      .run(s.path, s.title, s.description, s.keywords, s.ogImage, s.canonical, s.noindex ? 1 : 0);
  },

  rename(from: string, to: string) {
    if (from !== to) getDb().prepare("UPDATE seo_pages SET path = ? WHERE path = ?").run(to, from);
  },

  delete(path: string) {
    getDb().prepare("DELETE FROM seo_pages WHERE path = ?").run(path);
  },
};
