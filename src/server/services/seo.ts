import "server-only";
import type { Metadata } from "next";
import { settingsRepo } from "../repositories/settings";
import { seoPagesRepo } from "../repositories/seo-pages";
import { productsRepo } from "../repositories/products";
import { pagesRepo } from "../repositories/pages";
import { STATIC_PAGES } from "../defaults";
import { clip, resolvePageSeo, scoreSeo, type ResolvedSeo, type SeoFallback, type SeoLevel } from "@/lib/seo";

/** Custom page for a single-segment path like /projects (drafts included, for the admin preview). */
const pageForPath = (path: string) => {
  const m = path.match(/^\/([a-z0-9-]+)$/);
  return m ? pagesRepo.getBySlug(m[1], { includeDrafts: true }) : null;
};

/**
 * Content-derived SEO used when the admin hasn't set an override.
 * Single source of truth for both the public pages and the admin preview/audit.
 */
export function fallbackFor(path: string): SeoFallback {
  if (path === "/about") {
    return {
      title: "About Us",
      description:
        "ERA Interior is a trusted Ahmedabad supplier of premium interior and exterior materials – natural stone, wood flooring, WPC, wallpaper, carpet and more.",
    };
  }
  if (path === "/contact") {
    return {
      title: "Contact Us – Get a Free Quote",
      description:
        "Contact ERA Interior Products in South Bopal, Ahmedabad for flooring, cladding, wallpaper and décor. Call, visit or send an enquiry for a free quote.",
    };
  }
  const page = pageForPath(path);
  if (page) {
    const firstText = page.sections.find((s) => s.text)?.text ?? "";
    return {
      title: page.title,
      description: clip(`${page.subtitle} ${firstText}`.replace(/\s+/g, " ").trim()),
      image: page.sections.find((s) => s.image)?.image,
    };
  }
  const m = path.match(/^\/products\/([a-z0-9-]+)$/);
  const p = m ? productsRepo.getBySlug(m[1], { includeDrafts: true }) : null;
  if (p) {
    return {
      title: `${p.name} in Ahmedabad`,
      description: clip(`${p.tagline} ${p.description}`),
      keywords: [p.name, ...p.content.varieties, ...p.content.types.map((t) => t.name)].join(", "),
      image: p.heroImage,
    };
  }
  return {};
}

/** Effective SEO for a path (override → content fallback → global defaults). */
export function resolveSeo(path: string): ResolvedSeo {
  return resolvePageSeo(path, settingsRepo.getSeo(), seoPagesRepo.get(path), fallbackFor(path));
}

/** Next.js Metadata for a public page. */
export function buildMetadata(path: string): Metadata {
  const { siteName, locale, twitterHandle } = settingsRepo.getSeo();
  const s = resolveSeo(path);

  return {
    title: { absolute: s.title },
    description: s.description,
    keywords: s.keywords || undefined,
    alternates: { canonical: s.canonical },
    robots: s.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "website",
      url: s.canonical,
      title: s.title,
      description: s.description,
      siteName,
      locale,
      images: [{ url: s.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.title,
      description: s.description,
      images: [s.ogImage],
      site: twitterHandle || undefined,
    },
  };
}

/** All public URLs that can carry SEO (static pages, custom pages, every product). */
export function seoTargets(): { path: string; label: string }[] {
  return [
    ...STATIC_PAGES.map((p) => ({ path: p.path as string, label: p.label as string })),
    ...pagesRepo
      .list({ includeDrafts: true })
      .map((p) => ({ path: `/${p.slug}`, label: `${p.title}${p.published ? "" : " (draft)"}` })),
    ...productsRepo
      .list({ includeDrafts: true })
      .map((p) => ({ path: `/products/${p.slug}`, label: `${p.name}${p.published ? "" : " (draft)"}` })),
  ];
}

export interface AuditRow {
  path: string;
  label: string;
  hasOverride: boolean;
  title: string;
  description: string;
  score: number;
  level: SeoLevel;
  issues: number;
}

export function auditAllPages(): AuditRow[] {
  const overridden = new Set(seoPagesRepo.list().map((o) => o.path));
  return seoTargets().map(({ path, label }) => {
    const r = resolveSeo(path);
    const s = scoreSeo(r);
    return { path, label, hasOverride: overridden.has(path), title: r.title, description: r.description, score: s.score, level: s.level, issues: s.issues.length };
  });
}
