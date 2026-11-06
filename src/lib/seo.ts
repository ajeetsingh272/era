/* Pure SEO helpers – no I/O, safe to unit test and to import from client components. */
import type { PageSeo, SeoSettings } from "@/types";

export interface SeoFallback {
  /** Short page title; the site title template is applied to it. */
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  noindex: boolean;
}

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (!pathOrUrl) return siteUrl.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return siteUrl.replace(/\/+$/, "") + (pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`);
}

/** Shorten text to `max` chars at a word boundary (for meta descriptions). */
export function clip(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,.;:–-]+$/, "") + "…";
}

export function applyTemplate(template: string, title: string): string {
  return template.includes("%s") ? template.replace("%s", title) : `${title} | ${template}`;
}

/**
 * Precedence: admin per-page override → page fallback (from content) → global defaults.
 * An override title is used verbatim (what the admin types is what Google sees);
 * a fallback title gets the site template applied.
 */
export function resolvePageSeo(path: string, settings: SeoSettings, override: PageSeo | null, fallback: SeoFallback = {}): ResolvedSeo {
  const title = override?.title?.trim()
    ? override.title.trim()
    : fallback.title
      ? applyTemplate(settings.titleTemplate, fallback.title)
      : settings.defaultTitle;

  return {
    title,
    description: override?.description?.trim() || fallback.description || settings.defaultDescription,
    keywords: override?.keywords?.trim() || fallback.keywords || settings.defaultKeywords,
    canonical: absoluteUrl(settings.siteUrl, override?.canonical?.trim() || path),
    ogImage: absoluteUrl(settings.siteUrl, override?.ogImage?.trim() || fallback.image || settings.defaultOgImage),
    noindex: !settings.allowIndexing || !!override?.noindex,
  };
}

export type SeoLevel = "good" | "ok" | "poor";
export interface SeoIssue { level: "error" | "warning"; message: string }

export const LIMITS = { titleMin: 30, titleMax: 60, descMin: 70, descMax: 160 } as const;

/** Simple on-page SEO audit used by the admin panel. */
export function scoreSeo(s: ResolvedSeo, focusKeyword = ""): { score: number; level: SeoLevel; issues: SeoIssue[] } {
  const issues: SeoIssue[] = [];
  let score = 100;
  const fail = (level: SeoIssue["level"], message: string, cost: number) => {
    issues.push({ level, message });
    score -= cost;
  };

  const t = s.title.length;
  if (!t) fail("error", "Title is missing.", 30);
  else if (t < LIMITS.titleMin) fail("warning", `Title is short (${t} chars). Aim for ${LIMITS.titleMin}–${LIMITS.titleMax}.`, 10);
  else if (t > LIMITS.titleMax) fail("warning", `Title is long (${t} chars) and may be cut off in Google. Aim for ≤ ${LIMITS.titleMax}.`, 10);

  const d = s.description.length;
  if (!d) fail("error", "Meta description is missing.", 25);
  else if (d < LIMITS.descMin) fail("warning", `Description is short (${d} chars). Aim for ${LIMITS.descMin}–${LIMITS.descMax}.`, 10);
  else if (d > LIMITS.descMax) fail("warning", `Description is long (${d} chars) and may be truncated. Aim for ≤ ${LIMITS.descMax}.`, 8);

  if (!s.ogImage) fail("warning", "No social sharing image (Open Graph).", 10);
  if (s.noindex) fail("error", "Page is hidden from search engines (noindex).", 40);

  const kw = focusKeyword.trim().toLowerCase();
  if (kw) {
    if (!s.title.toLowerCase().includes(kw)) fail("warning", `Main keyword "${focusKeyword}" is not in the title.`, 8);
    if (!s.description.toLowerCase().includes(kw)) fail("warning", `Main keyword "${focusKeyword}" is not in the description.`, 5);
  }

  score = Math.max(0, score);
  return { score, level: score >= 80 ? "good" : score >= 50 ? "ok" : "poor", issues };
}
