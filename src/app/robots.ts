import type { MetadataRoute } from "next";
import { settingsRepo } from "@/server/repositories/settings";
import { absoluteUrl } from "@/lib/seo";
import { lines } from "@/lib/text-lists";

export const revalidate = 3600;

/** Controlled from Admin → SEO (indexing switch + extra disallow rules). */
export default function robots(): MetadataRoute.Robots {
  const { siteUrl, allowIndexing, robotsDisallow } = settingsRepo.getSeo();
  if (!allowIndexing) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", ...lines(robotsDisallow)] },
    sitemap: absoluteUrl(siteUrl, "/sitemap.xml"),
    host: siteUrl,
  };
}
