import { describe, expect, it } from "vitest";
import { absoluteUrl, applyTemplate, clip, resolvePageSeo, scoreSeo } from "@/lib/seo";

describe("clip", () => {
  it("keeps short text and cuts long text at a word boundary", () => {
    expect(clip("short  text")).toBe("short text");
    const out = clip("word ".repeat(60), 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("word…")).toBe(true);
  });
});
import { DEFAULT_SEO } from "@/server/defaults";
import type { PageSeo } from "@/types";

const settings = { ...DEFAULT_SEO, siteUrl: "https://www.example.com" };
const override = (o: Partial<PageSeo>): PageSeo => ({
  path: "/about", title: "", description: "", keywords: "", ogImage: "", canonical: "", noindex: false, updatedAt: "", ...o,
});

describe("absoluteUrl", () => {
  it("joins paths and keeps absolute URLs", () => {
    expect(absoluteUrl("https://x.com/", "/a")).toBe("https://x.com/a");
    expect(absoluteUrl("https://x.com", "a")).toBe("https://x.com/a");
    expect(absoluteUrl("https://x.com", "https://cdn.y.com/i.jpg")).toBe("https://cdn.y.com/i.jpg");
  });
});

describe("applyTemplate", () => {
  it("replaces %s or appends", () => {
    expect(applyTemplate("%s | ERA", "About")).toBe("About | ERA");
    expect(applyTemplate("ERA", "About")).toBe("About | ERA");
  });
});

describe("resolvePageSeo precedence", () => {
  it("falls back to global defaults", () => {
    const r = resolvePageSeo("/", settings, null);
    expect(r.title).toBe(settings.defaultTitle);
    expect(r.description).toBe(settings.defaultDescription);
    expect(r.canonical).toBe("https://www.example.com/");
    expect(r.ogImage).toBe("https://www.example.com/images/cov.jpg");
  });

  it("applies the template to content fallbacks", () => {
    const r = resolvePageSeo("/about", settings, null, { title: "About Us", description: "d" });
    expect(r.title).toBe("About Us | ERA Interior Products");
    expect(r.description).toBe("d");
  });

  it("uses admin overrides verbatim, ignoring blanks", () => {
    const r = resolvePageSeo("/about", settings, override({ title: "Custom", canonical: "/other", description: "  " }), { title: "About Us", description: "fallback" });
    expect(r.title).toBe("Custom");
    expect(r.description).toBe("fallback");
    expect(r.canonical).toBe("https://www.example.com/other");
  });

  it("global indexing switch forces noindex", () => {
    expect(resolvePageSeo("/", { ...settings, allowIndexing: false }, null).noindex).toBe(true);
    expect(resolvePageSeo("/", settings, override({ noindex: true })).noindex).toBe(true);
  });
});

describe("scoreSeo", () => {
  const good = resolvePageSeo("/x", settings, override({
    title: "Wooden Flooring in Ahmedabad | ERA Interior",
    description: "Engineered, laminate and IPE wooden flooring in Ahmedabad with expert advice, samples and quick delivery. Get a free quote today.",
  }));

  it("rates a well-formed page as good", () => {
    const s = scoreSeo(good, "wooden flooring");
    expect(s.level).toBe("good");
    expect(s.issues).toHaveLength(0);
  });

  it("flags long titles, missing keyword and noindex", () => {
    const s = scoreSeo({ ...good, title: "x".repeat(80), noindex: true }, "tiles");
    expect(s.level).not.toBe("good");
    expect(s.issues.map((i) => i.message).join(" ")).toMatch(/long.*noindex|noindex/s);
  });
});
