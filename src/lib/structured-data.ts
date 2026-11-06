/* Schema.org JSON-LD builders (pure). */
import type { BusinessSettings, Faq, SeoSettings } from "@/types";
import { absoluteUrl } from "./seo";

export function localBusinessLd(b: BusinessSettings, seo: SeoSettings) {
  const sameAs = [b.instagram, b.facebook].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": absoluteUrl(seo.siteUrl, "/#business"),
    name: b.name,
    url: absoluteUrl(seo.siteUrl, "/"),
    logo: absoluteUrl(seo.siteUrl, "/images/logo.jpg"),
    image: absoluteUrl(seo.siteUrl, seo.defaultOgImage),
    description: seo.defaultDescription,
    telephone: b.tel || undefined,
    email: b.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: b.city,
      addressRegion: b.region,
      postalCode: b.postalCode,
      addressCountry: b.country,
    },
    hasMap: b.mapsUrl || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function websiteLd(seo: SeoSettings) {
  return { "@context": "https://schema.org", "@type": "WebSite", name: seo.siteName, url: absoluteUrl(seo.siteUrl, "/"), inLanguage: "en-IN" };
}

export function breadcrumbLd(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(siteUrl, it.path) })),
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function productLd(siteUrl: string, p: { name: string; description: string; image: string; slug: string }, brand: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: absoluteUrl(siteUrl, p.image),
    url: absoluteUrl(siteUrl, `/products/${p.slug}`),
    brand: { "@type": "Brand", name: brand },
  };
}
