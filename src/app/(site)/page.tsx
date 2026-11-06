import Link from "next/link";
import type { Metadata } from "next";
import { HeroSlider } from "@/components/site/HeroSlider";
import { Img } from "@/components/site/Img";
import { Prose } from "@/components/site/Prose";
import { SectionHead } from "@/components/site/Display";
import { productsRepo } from "@/server/repositories/products";
import { settingsRepo } from "@/server/repositories/settings";
import { buildMetadata } from "@/server/services/seo";

export function generateMetadata(): Metadata {
  return buildMetadata("/");
}

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

export default function HomePage() {
  const products = productsRepo.list();
  const firstHref = products[0] ? `/products/${products[0].slug}` : "/contact";
  const h = settingsRepo.getHome();
  // The headline slide comes first: it carries the page's H1.
  const slides = [{ image: h.heroImage, title: h.heroTitle, text: h.heroText, href: firstHref }, ...h.slides].filter((s) => s.image);
  let n = 0;

  return (
    <>
      <HeroSlider slides={slides} label={h.heroLabel} primaryHref={firstHref} />

      <section className="sec" id="content">
        <div className="wrap split">
          <div className="split-media">
            <div className="cr frame"><Img src={h.aboutImage} alt="ERA Interior materials in a finished space" sizes="(max-width: 900px) 92vw, 45vw" /></div>
            {h.aboutImage2 && <div className="cr inset"><Img src={h.aboutImage2} alt="" sizes="(max-width: 900px) 45vw, 20vw" /></div>}
          </div>
          <div>
            <SectionHead num={++n} label={h.aboutLabel || "About us"} center={false} />
            <h2 className="h2 rv" style={d(1)}>{h.aboutTitle}</h2>
            <div className="prose"><Prose text={h.aboutText} from={2} /></div>
            {h.aboutPoints.length > 0 && (
              <ul className="list rv" style={d(4)}>{h.aboutPoints.map((t) => <li key={t}>{t}</li>)}</ul>
            )}
            <div className="stats rv" style={d(5)}>
              <div><b data-n={products.length}>{products.length}</b><span>Product ranges</span></div>
              <div><b data-n="6">6</b><span>Application areas</span></div>
              <div><b data-n="2">2</b><span>Indoor &amp; outdoor</span></div>
            </div>
            <Link className="lnk rv" style={d(6)} href="/about">More about us</Link>
          </div>
        </div>
      </section>

      {h.tiles.length > 0 && (
        <section className="sec alt">
          <div className="wrap">
            <SectionHead num={++n} label={h.offerLabel || "What we offer"} title={h.offerTitle} />
            {h.offerText && <p className="lead c rv">{h.offerText}</p>}
            <div className="cards">
              {h.tiles.map((t, i) => (
                <Link key={i} className="card rv" style={d(i % 3)} href={t.href || "/"}>
                  <div className="card-img">
                    <Img src={t.image} alt={t.title} sizes="(max-width: 600px) 92vw, (max-width: 1000px) 45vw, 30vw" />
                    <span className="tag">{t.title}</span>
                  </div>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SectionHead num={++n} label="Our products" title="Materials for every space" />
            <div className="cards five">
              {products.map((p, i) => (
                <Link key={p.slug} className="card rv" style={d(i % 5)} href={`/products/${p.slug}`}>
                  <div className="card-img tall">
                    <Img src={p.heroImage} alt={p.name} sizes="(max-width: 600px) 46vw, (max-width: 1100px) 31vw, 19vw" />
                  </div>
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {h.why.length > 0 && (
        <section className="sec alt">
          <div className="wrap">
            <SectionHead num={++n} label={h.whyLabel || "Why choose us"} title={h.whyTitle} />
            <div className="svc">
              {h.why.map((w, i) => (
                <div key={i} className="rv" style={d(i % 2)}>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {h.steps.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SectionHead num={++n} label={h.stepsLabel || "How it works"} title={h.stepsTitle} />
            <ol className="steps">
              {h.steps.map((s, i) => (
                <li key={i} className="rv" style={d(i)}>
                  <span className="num sm" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="band">
        <div className="band-bg" aria-hidden="true" data-speed="-0.25"><Img src={h.ctaImage} alt="" sizes="100vw" /></div>
        <div className="wrap band-in rv">
          <p className="lbl c">Let&apos;s talk</p>
          <h2 className="h2">{h.ctaTitle}</h2>
          {h.ctaText && <p className="lead c">{h.ctaText}</p>}
          <Link className="btn" href="/contact">Contact us</Link>
        </div>
      </section>
    </>
  );
}
