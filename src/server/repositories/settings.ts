import "server-only";
import { getDb } from "../db";
import { DEFAULT_BUSINESS, DEFAULT_SEO } from "../defaults";
import { DEFAULT_ABOUT, DEFAULT_HOME } from "@/content/home";
import type { AboutContent, BusinessSettings, HomeContent, SeoSettings, Settings } from "@/types";

const DEFAULTS: Settings = { business: DEFAULT_BUSINESS, seo: DEFAULT_SEO, home: DEFAULT_HOME, about: DEFAULT_ABOUT };
type Key = keyof Settings;

function read<K extends Key>(key: K): Settings[K] {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  // Merge with defaults so newly added fields always have a value.
  return { ...DEFAULTS[key], ...(row ? (JSON.parse(row.value) as Partial<Settings[K]>) : {}) } as Settings[K];
}

function write<K extends Key>(key: K, value: Settings[K]) {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, JSON.stringify(value));
}

export const settingsRepo = {
  getBusiness: (): BusinessSettings => read("business"),
  getSeo: (): SeoSettings => read("seo"),
  getAll: () => ({ business: read("business"), seo: read("seo") }),
  saveBusiness: (v: BusinessSettings) => write("business", v),
  saveSeo: (v: SeoSettings) => write("seo", v),
  getHome: (): HomeContent => read("home"),
  saveHome: (v: HomeContent) => write("home", v),
  getAbout: (): AboutContent => read("about"),
  saveAbout: (v: AboutContent) => write("about", v),
};
