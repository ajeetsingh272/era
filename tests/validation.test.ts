import { describe, expect, it } from "vitest";
import { contactSchema, pageSeoSchema, productFormSchema, seoSettingsSchema } from "@/lib/validation";
import { rows, slugify } from "@/lib/text-lists";
import { csvCell } from "@/lib/format";
import { DEFAULT_SEO } from "@/server/defaults";

describe("text lists", () => {
  it("parses pipe rows, padding and keeping extra pipes in last column", () => {
    expect(rows("A | B\n\n C |D|E \nF", 2)).toEqual([["A", "B"], ["C", "D | E"], ["F", ""]]);
  });
  it("slugifies", () => {
    expect(slugify("  Engineered Wood Floor! ")).toBe("engineered-wood-floor");
    expect(slugify("Décor & Más")).toBe("decor-mas");
  });
});

describe("contactSchema", () => {
  it("accepts a valid enquiry and rejects a filled honeypot", () => {
    expect(contactSchema.safeParse({ name: "Ravi", contact: "9898989898", website: "" }).success).toBe(true);
    expect(contactSchema.safeParse({ name: "Ravi", contact: "9898989898", website: "spam" }).success).toBe(false);
    expect(contactSchema.safeParse({ name: "R", contact: "1" }).success).toBe(false);
  });
});

describe("seoSettingsSchema", () => {
  const base = { ...DEFAULT_SEO, siteUrl: "https://www.example.com/", allowIndexing: "on" };
  it("normalises URL and checkbox", () => {
    const r = seoSettingsSchema.parse(base);
    expect(r.siteUrl).toBe("https://www.example.com");
    expect(r.allowIndexing).toBe(true);
    expect(seoSettingsSchema.parse({ ...base, allowIndexing: undefined }).allowIndexing).toBe(false);
  });
  it("requires %s in template and valid GA id", () => {
    expect(seoSettingsSchema.safeParse({ ...base, titleTemplate: "ERA" }).success).toBe(false);
    expect(seoSettingsSchema.safeParse({ ...base, gaMeasurementId: "UA-123" }).success).toBe(false);
  });
});

describe("pageSeoSchema", () => {
  it("rejects javascript: URLs", () => {
    expect(pageSeoSchema.safeParse({ path: "/about", title: "", description: "", keywords: "", ogImage: "javascript:alert(1)", canonical: "" }).success).toBe(false);
  });
});

describe("productFormSchema", () => {
  it("maps textarea fields into structured content", () => {
    const p = productFormSchema.parse({
      name: "Bamboo", slug: "bamboo", tagline: "", description: "", heroImage: "/images/a.jpg", swatchImage: "",
      sortOrder: "3", published: "on", overview: "o", features: "Strong | Very strong\nGreen | Eco", uses: "Floors\nWalls",
      varieties: "", specs: "Size | 1m", care: "Sweep", gallery: JSON.stringify([{ image: "/uploads/g-0123456789ab.jpg" }, { image: "" }]),
      types: JSON.stringify([{ name: "Natural", description: "Light", bestFor: "Homes", image: "/images/t.jpg" }, { name: "", description: "", bestFor: "", image: "" }]),
      materialText: "", materialComponents: "Bamboo", materialBenefits: "", guideAbout: "", guideMade: "", guideInstall: "",
      guidePros: "", guideCons: "", guideFaqs: "Is it hard? | Yes",
    });
    expect(p.sortOrder).toBe(3);
    expect(p.published).toBe(true);
    expect(p.content.features).toEqual([{ title: "Strong", detail: "Very strong" }, { title: "Green", detail: "Eco" }]);
    expect(p.content.types).toEqual([{ name: "Natural", description: "Light", bestFor: "Homes", image: "/images/t.jpg" }]);
    expect(p.content.gallery).toEqual(["/uploads/g-0123456789ab.jpg"]); // empty rows dropped
    expect(p.content.guide.faqs).toEqual([{ q: "Is it hard?", a: "Yes" }]);
  });
  it("rejects bad slugs", () => {
    expect(productFormSchema.safeParse({ slug: "Bad Slug" }).success).toBe(false);
  });
});

describe("csvCell", () => {
  it("quotes and neutralises formulas", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
  });
});
