import type { BusinessSettings, SeoSettings } from "@/types";

export const DEFAULT_BUSINESS: BusinessSettings = {
  name: "ERA Interior Products",
  phone: "098983 58156",
  tel: "+919898358156",
  email: "",
  address: "306, Gala Hub ANX, Gala Gymkhana Rd, South Bopal, Bopal",
  city: "Ahmedabad",
  region: "Gujarat",
  postalCode: "380058",
  country: "IN",
  mapsUrl: "https://share.google/Nv3djc0Cc2UydSSnw",
  instagram: "https://www.instagram.com/era.interior.products/",
  facebook: "",
  whatsapp: "919898358156",
};

export const DEFAULT_SEO: SeoSettings = {
  siteName: "ERA Interior Products",
  siteUrl: process.env.SITE_URL || "http://localhost:3000",
  titleTemplate: "%s | ERA Interior Products",
  defaultTitle: "ERA Interior Products – Flooring, Cladding & Décor in Ahmedabad",
  defaultDescription:
    "Premium natural stone, IPE & engineered wood flooring, WPC cladding, wallpaper, carpet, glass mosaic, artificial grass and soffit panels in Ahmedabad. Get a free quote.",
  defaultKeywords:
    "interior products Ahmedabad, wooden flooring, WPC cladding, natural stone, wallpaper, artificial grass, glass mosaic, soffit panels",
  defaultOgImage: "/images/cov.jpg",
  twitterHandle: "",
  locale: "en_IN",
  allowIndexing: true,
  robotsDisallow: "",
  googleVerification: "",
  bingVerification: "",
  gaMeasurementId: "",
  gtmId: "",
};

/** Public static routes that can carry per-page SEO overrides. */
export const STATIC_PAGES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About Us" },
  { path: "/contact", label: "Contact Us" },
] as const;
