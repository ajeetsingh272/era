import { beforeEach, describe, expect, it } from "vitest";
import { resetDbForTests } from "@/server/db";
import { pagesRepo } from "@/server/repositories/pages";
import { settingsRepo } from "@/server/repositories/settings";
import { seoTargets, resolveSeo } from "@/server/services/seo";
import { imageUsage } from "@/server/services/media";
import { aboutContentSchema, fieldErrors, homeContentSchema, pageFormSchema } from "@/lib/validation";
import { DEFAULT_HOME } from "@/content/home";
import type { PageSection } from "@/types";

beforeEach(() => resetDbForTests());

const section = (s: Partial<PageSection> = {}): PageSection => ({
  heading: "Our work", text: "Villas and offices.", image: "/uploads/a-0123456789ab.jpg", imageSide: "right", buttonLabel: "", buttonHref: "", ...s,
});
const pageForm = (over: Record<string, string> = {}) => ({
  title: "Projects", slug: "projects", subtitle: "Recent installations", sections: JSON.stringify([section()]),
  showInMenu: "on", sortOrder: "1", published: "on", ...over,
});

describe("pageFormSchema", () => {
  it("parses sections posted as JSON", () => {
    const r = pageFormSchema.safeParse(pageForm());
    expect(r.success).toBe(true);
    expect(r.data?.sections[0].heading).toBe("Our work");
    expect(r.data?.showInMenu).toBe(true);
  });

  it("blocks addresses used by built-in routes", () => {
    const r = pageFormSchema.safeParse(pageForm({ slug: "products" }));
    expect(r.success).toBe(false);
    expect(fieldErrors(r.error!).slug).toMatch(/used by the site/);
  });

  it("names the broken list item and rejects bad links / malformed JSON", () => {
    const bad = pageFormSchema.safeParse(pageForm({ sections: JSON.stringify([section(), section({ buttonHref: "javascript:alert(1)" })]) }));
    expect(fieldErrors(bad.error!).sections).toMatch(/^Item 2:/);
    const broken = pageFormSchema.safeParse(pageForm({ sections: "{not json" }));
    expect(broken.success).toBe(false);
  });
});

describe("home / about content", () => {
  it("round-trips the default home content through the form schema", () => {
    const form = {
      ...DEFAULT_HOME,
      aboutPoints: DEFAULT_HOME.aboutPoints.join("\n"),
      slides: JSON.stringify(DEFAULT_HOME.slides),
      tiles: JSON.stringify(DEFAULT_HOME.tiles),
      why: JSON.stringify(DEFAULT_HOME.why),
      steps: JSON.stringify(DEFAULT_HOME.steps),
    };
    const r = homeContentSchema.safeParse(form);
    expect(r.success).toBe(true);
    expect(r.data).toEqual(DEFAULT_HOME);
  });

  it("falls back to defaults until saved, then returns saved content", () => {
    expect(settingsRepo.getAbout().bannerTitle).toBe("About Us");
    const r = aboutContentSchema.parse({ ...settingsRepo.getAbout(), points: "One\nTwo", bannerTitle: "Our Story" });
    settingsRepo.saveAbout(r);
    expect(settingsRepo.getAbout()).toMatchObject({ bannerTitle: "Our Story", points: ["One", "Two"] });
  });
});

describe("imageUsage", () => {
  it("reports every place an image is used, so in-use images can't be deleted", () => {
    pagesRepo.create({ title: "Projects", slug: "projects", subtitle: "", sections: [section()], showInMenu: false, sortOrder: 1, published: true });
    const usage = imageUsage();
    expect(usage.get("/uploads/a-0123456789ab.jpg")).toEqual(["Page: Projects (section 1)"]);
    expect(usage.get("/images/stone_h.jpg")).toContain("Product: Natural Stone (main image)");
    expect(usage.get("/images/cov.jpg")).toEqual(expect.arrayContaining(["Home: call-to-action", "Global SEO: default share image"]));
  });
});

describe("pagesRepo + SEO", () => {
  it("stores pages, hides drafts publicly and exposes them to SEO", () => {
    const id = pagesRepo.create({ title: "Projects", slug: "projects", subtitle: "Recent work", sections: [section()], showInMenu: true, sortOrder: 1, published: false });
    expect(pagesRepo.getBySlug("projects")).toBeNull();
    expect(pagesRepo.getBySlug("projects", { includeDrafts: true })?.sections).toHaveLength(1);
    expect(pagesRepo.slugTaken("projects")).toBe(true);
    expect(pagesRepo.slugTaken("projects", id)).toBe(false);

    expect(seoTargets().some((t) => t.path === "/projects" && t.label.includes("draft"))).toBe(true);
    const seo = resolveSeo("/projects");
    expect(seo.title).toContain("Projects");
    expect(seo.description).toContain("Recent work");
    expect(seo.ogImage).toContain("/uploads/a-0123456789ab.jpg");
  });
});
