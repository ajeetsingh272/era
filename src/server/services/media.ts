import "server-only";
import { productsRepo } from "../repositories/products";
import { pagesRepo } from "../repositories/pages";
import { settingsRepo } from "../repositories/settings";
import { seoPagesRepo } from "../repositories/seo-pages";

/** Where each image URL is used across the site: url → human-readable places. */
export function imageUsage(): Map<string, string[]> {
  const used = new Map<string, string[]>();
  const add = (url: string | undefined, where: string) => {
    if (!url) return;
    const list = used.get(url) ?? [];
    if (!list.includes(where)) list.push(where);
    used.set(url, list);
  };

  for (const p of productsRepo.list({ includeDrafts: true })) {
    const at = `Product: ${p.name}`;
    add(p.heroImage, `${at} (main image)`);
    add(p.swatchImage, `${at} (colour samples)`);
    p.content.gallery.forEach((g) => add(g, `${at} (gallery)`));
    p.content.types.forEach((t) => add(t.image, `${at} (type: ${t.name})`));
  }

  const home = settingsRepo.getHome();
  add(home.heroImage, "Home: hero image");
  home.slides.forEach((s, i) => add(s.image, `Home: slide ${i + 1}`));
  home.tiles.forEach((t) => add(t.image, `Home: tile “${t.title}”`));
  add(home.aboutImage, "Home: about section");
  add(home.aboutImage2, "Home: about section");
  add(home.ctaImage, "Home: call-to-action");

  const about = settingsRepo.getAbout();
  add(about.image, "About Us page");
  add(about.image2, "About Us page");

  for (const p of pagesRepo.list({ includeDrafts: true })) {
    p.sections.forEach((s, i) => add(s.image, `Page: ${p.title} (section ${i + 1})`));
  }

  add(settingsRepo.getSeo().defaultOgImage, "Global SEO: default share image");
  for (const s of seoPagesRepo.list()) add(s.ogImage, `Page SEO: ${s.path} (share image)`);

  return used;
}
