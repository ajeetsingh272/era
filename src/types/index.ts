/* Domain model shared by server, admin and public site. */

export interface Feature { title: string; detail: string }
export interface Spec { label: string; value: string }
export interface ProductType { name: string; description: string; bestFor: string; image: string }
export interface Faq { q: string; a: string }

export interface ProductContent {
  overview: string;
  features: Feature[];
  uses: string[];
  varieties: string[];
  specs: Spec[];
  care: string[];
  gallery: string[];
  types: ProductType[];
  material: { text: string; components: string[]; benefits: Feature[] };
  guide: { about: string; made: string; install: string; pros: string[]; cons: string[]; faqs: Faq[] };
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  swatchImage: string;
  sortOrder: number;
  published: boolean;
  content: ProductContent;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "updatedAt">;

export interface BusinessSettings {
  name: string;
  phone: string;
  tel: string;
  email: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  mapsUrl: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
}

export interface SeoSettings {
  siteName: string;
  siteUrl: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultOgImage: string;
  twitterHandle: string;
  locale: string;
  allowIndexing: boolean;
  robotsDisallow: string;
  googleVerification: string;
  bingVerification: string;
  gaMeasurementId: string;
  gtmId: string;
}

/* ---------- Editable page content ---------- */

export interface LinkCard { image: string; title: string; text: string; href: string }
export interface TextItem { title: string; text: string }

export interface HomeContent {
  heroLabel: string;
  heroTitle: string;
  heroText: string;
  heroImage: string;
  slides: LinkCard[];
  aboutLabel: string;
  aboutTitle: string;
  aboutText: string;
  aboutPoints: string[];
  aboutImage: string;
  aboutImage2: string;
  offerLabel: string;
  offerTitle: string;
  offerText: string;
  tiles: LinkCard[];
  whyLabel: string;
  whyTitle: string;
  why: TextItem[];
  stepsLabel: string;
  stepsTitle: string;
  steps: TextItem[];
  ctaTitle: string;
  ctaText: string;
  ctaImage: string;
}

export interface AboutContent {
  bannerTitle: string;
  bannerSubtitle: string;
  label: string;
  title: string;
  text: string;
  points: string[];
  image: string;
  image2: string;
}

export interface Settings { business: BusinessSettings; seo: SeoSettings; home: HomeContent; about: AboutContent }

/** A block on a custom page: heading + text with an optional image beside it. */
export interface PageSection {
  heading: string;
  text: string;
  image: string;
  imageSide: "left" | "right";
  buttonLabel: string;
  buttonHref: string;
}

export interface CustomPage {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  sections: PageSection[];
  showInMenu: boolean;
  sortOrder: number;
  published: boolean;
  updatedAt: string;
}

export type CustomPageInput = Omit<CustomPage, "id" | "updatedAt">;

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonical: string;
  noindex: boolean;
  updatedAt: string;
}

export type PageSeoInput = Omit<PageSeo, "updatedAt">;

export type EnquiryStatus = "new" | "read" | "archived";

export interface Enquiry {
  id: number;
  name: string;
  contact: string;
  product: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface AdminUser { id: number; email: string; name: string }

/** An image available in the admin media library. */
export interface MediaItem {
  url: string;
  name: string;
  /** true = uploaded in the admin, false = shipped with the site (public/images). */
  uploaded: boolean;
  modified: number;
  size: number;
}
