import { z } from "zod";
import { lines, rows } from "./text-lists";
import type { ProductInput } from "@/types";

const str = (max = 500) => z.string().trim().max(max);
const optionalUrlOrPath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), "Use a path starting with / or a full https:// URL");
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/** A repeatable list posted as a JSON string (from the admin RepeaterField). */
const jsonList = <T extends z.ZodTypeAny>(item: T, max: number) =>
  z
    .string()
    .default("[]")
    .transform((v, ctx) => {
      try {
        return JSON.parse(v) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Could not read this list – please try again." });
        return z.NEVER;
      }
    })
    .pipe(z.array(item).max(max, `At most ${max} items`));

const productTypeItem = z.object({ name: str(120), description: str(1000), bestFor: str(300), image: optionalUrlOrPath });
const galleryItem = z.object({ image: optionalUrlOrPath });

/** Read a FormData into a plain object (multi-valued keys keep the last value). */
export const formObject = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));

export const contactSchema = z.object({
  name: str(100).min(2, "Please enter your name"),
  contact: str(150).min(5, "Please enter a phone number or email"),
  product: str(100).default(""),
  message: str(2000).default(""),
  website: z.string().max(0).optional().default(""), // honeypot – must stay empty
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password").max(200),
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(10, "New password must be at least 10 characters").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const businessSchema = z.object({
  name: str(120).min(2),
  phone: str(40),
  tel: str(40).regex(/^\+?[0-9 ]*$/, "Digits only, optionally starting with +"),
  email: z.union([z.literal(""), z.string().trim().email()]),
  address: str(300),
  city: str(80),
  region: str(80),
  postalCode: str(20),
  country: str(2).toUpperCase(),
  mapsUrl: optionalUrlOrPath,
  instagram: optionalUrlOrPath,
  facebook: optionalUrlOrPath,
  whatsapp: str(20).regex(/^[0-9]*$/, "Digits only, with country code (e.g. 9198…)"),
});

export const seoSettingsSchema = z.object({
  siteName: str(80).min(2),
  siteUrl: z.string().trim().url("Enter the full site URL, e.g. https://www.example.com").transform((v) => v.replace(/\/+$/, "")),
  titleTemplate: str(120).refine((v) => v.includes("%s"), "Template must contain %s (where the page title goes)"),
  defaultTitle: str(120).min(5),
  defaultDescription: str(300).min(20),
  defaultKeywords: str(500),
  defaultOgImage: optionalUrlOrPath,
  twitterHandle: str(40),
  locale: str(10),
  allowIndexing: checkbox,
  robotsDisallow: str(2000),
  googleVerification: str(200),
  bingVerification: str(200),
  gaMeasurementId: str(30).regex(/^(G-[A-Z0-9]+)?$/i, "Format: G-XXXXXXX"),
  gtmId: str(30).regex(/^(GTM-[A-Z0-9]+)?$/i, "Format: GTM-XXXXXXX"),
});

export const pageSeoSchema = z.object({
  path: z.string().trim().regex(/^\/[a-z0-9\-/]*$/, "Invalid path"),
  title: str(120),
  description: str(320),
  keywords: str(500),
  ogImage: optionalUrlOrPath,
  canonical: optionalUrlOrPath,
  noindex: checkbox,
});

const pairs = (t: string) => rows(t, 2);

export const productFormSchema = z
  .object({
    name: str(120).min(2),
    slug: str(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
    tagline: str(200),
    description: str(2000),
    heroImage: optionalUrlOrPath,
    swatchImage: optionalUrlOrPath,
    sortOrder: z.coerce.number().int().min(0).max(9999),
    published: checkbox,
    overview: str(4000),
    features: str(5000),
    uses: str(3000),
    varieties: str(3000),
    specs: str(5000),
    care: str(3000),
    gallery: jsonList(galleryItem, 40),
    types: jsonList(productTypeItem, 40),
    materialText: str(3000),
    materialComponents: str(2000),
    materialBenefits: str(4000),
    guideAbout: str(3000),
    guideMade: str(3000),
    guideInstall: str(3000),
    guidePros: str(3000),
    guideCons: str(3000),
    guideFaqs: str(8000),
  })
  .transform(
    (f): ProductInput => ({
      name: f.name,
      slug: f.slug,
      tagline: f.tagline,
      description: f.description,
      heroImage: f.heroImage,
      swatchImage: f.swatchImage,
      sortOrder: f.sortOrder,
      published: f.published,
      content: {
        overview: f.overview,
        features: pairs(f.features).map(([title, detail]) => ({ title, detail })),
        uses: lines(f.uses),
        varieties: lines(f.varieties),
        specs: pairs(f.specs).map(([label, value]) => ({ label, value })),
        care: lines(f.care),
        gallery: f.gallery.map((g) => g.image).filter(Boolean),
        types: f.types.filter((t) => t.name),
        material: {
          text: f.materialText,
          components: lines(f.materialComponents),
          benefits: pairs(f.materialBenefits).map(([title, detail]) => ({ title, detail })),
        },
        guide: {
          about: f.guideAbout,
          made: f.guideMade,
          install: f.guideInstall,
          pros: lines(f.guidePros),
          cons: lines(f.guideCons),
          faqs: pairs(f.guideFaqs).map(([q, a]) => ({ q, a })),
        },
      },
    }),
  );

/* ---------- Page content ---------- */

const linkCard = z.object({ image: optionalUrlOrPath, title: str(120), text: str(300), href: optionalUrlOrPath });
const textItem = z.object({ title: str(120), text: str(400) });

export const homeContentSchema = z
  .object({
    heroLabel: str(80),
    heroTitle: str(80).min(2),
    heroText: str(300),
    heroImage: optionalUrlOrPath,
    slides: jsonList(linkCard, 12),
    aboutLabel: str(80),
    aboutTitle: str(150),
    aboutText: str(3000),
    aboutPoints: str(1500),
    aboutImage: optionalUrlOrPath,
    aboutImage2: optionalUrlOrPath,
    offerLabel: str(80),
    offerTitle: str(150),
    offerText: str(300),
    tiles: jsonList(linkCard, 12),
    whyLabel: str(80),
    whyTitle: str(150),
    why: jsonList(textItem, 12),
    stepsLabel: str(80),
    stepsTitle: str(150),
    steps: jsonList(textItem, 8),
    ctaTitle: str(150),
    ctaText: str(300),
    ctaImage: optionalUrlOrPath,
  })
  .transform((f) => ({ ...f, aboutPoints: lines(f.aboutPoints) }));

export const aboutContentSchema = z
  .object({
    bannerTitle: str(80).min(2),
    bannerSubtitle: str(200),
    label: str(80),
    title: str(150),
    text: str(4000),
    points: str(1500),
    image: optionalUrlOrPath,
    image2: optionalUrlOrPath,
  })
  .transform((f) => ({ ...f, points: lines(f.points) }));

/** First URL segments used by built-in routes – custom pages can't take them. */
export const RESERVED_SLUGS = ["about", "contact", "products", "admin", "uploads", "images", "api", "sitemap", "robots", "icon"];

const pageSection = z.object({
  heading: str(150),
  text: str(6000),
  image: optionalUrlOrPath,
  imageSide: z.enum(["left", "right"]).catch("right"),
  buttonLabel: str(60),
  buttonHref: optionalUrlOrPath,
});

export const pageFormSchema = z.object({
  title: str(120).min(2, "Enter a page title"),
  slug: str(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only")
    .refine((v) => !RESERVED_SLUGS.includes(v), "This address is used by the site – choose another"),
  subtitle: str(250),
  sections: jsonList(pageSection, 40),
  showInMenu: checkbox,
  sortOrder: z.coerce.number().int().min(0).max(9999),
  published: checkbox,
});

/** Flatten zod issues to { field: message } for form display. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "_");
    const item = i.path.find((p) => typeof p === "number"); // list fields: say which entry is wrong
    if (!out[k]) out[k] = typeof item === "number" ? `Item ${item + 1}: ${i.message}` : i.message;
  }
  return out;
}

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;
