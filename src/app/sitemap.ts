import type { MetadataRoute } from "next";
import { productsRepo } from "@/server/repositories/products";
import { pagesRepo } from "@/server/repositories/pages";
import { settingsRepo } from "@/server/repositories/settings";
import { seoPagesRepo } from "@/server/repositories/seo-pages";
import { STATIC_PAGES } from "@/server/defaults";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

/** Auto-generated from published products; pages marked noindex in Admin are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl, allowIndexing } = settingsRepo.getSeo();
  if (!allowIndexing) return [];
  const hidden = new Set(seoPagesRepo.list().filter((s) => s.noindex).map((s) => s.path));

  const pages: MetadataRoute.Sitemap = STATIC_PAGES.filter((p) => !hidden.has(p.path)).map((p) => ({
    url: absoluteUrl(siteUrl, p.path),
    changeFrequency: "monthly",
    priority: p.path === "/" ? 1 : 0.7,
  }));

  for (const p of pagesRepo.list()) {
    const path = `/${p.slug}`;
    if (hidden.has(path)) continue;
    const images = p.sections.filter((s) => s.image).map((s) => absoluteUrl(siteUrl, s.image));
    pages.push({
      url: absoluteUrl(siteUrl, path),
      lastModified: new Date(p.updatedAt.replace(" ", "T") + "Z"),
      changeFrequency: "monthly",
      priority: 0.7,
      ...(images.length ? { images } : {}),
    });
  }

  for (const p of productsRepo.list()) {
    const path = `/products/${p.slug}`;
    if (hidden.has(path)) continue;
    pages.push({
      url: absoluteUrl(siteUrl, path),
      lastModified: new Date(p.updatedAt.replace(" ", "T") + "Z"),
      changeFrequency: "monthly",
      priority: 0.8,
      images: [absoluteUrl(siteUrl, p.heroImage)],
    });
  }
  return pages;
}
