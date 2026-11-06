import Link from "next/link";
import type { Metadata } from "next";
import { Img } from "@/components/site/Img";
import { PageBanner } from "@/components/site/PageBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { Prose } from "@/components/site/Prose";
import { SectionHead } from "@/components/site/Display";
import { buildMetadata } from "@/server/services/seo";
import { settingsRepo } from "@/server/repositories/settings";
import { productsRepo } from "@/server/repositories/products";
import { breadcrumbLd } from "@/lib/structured-data";

export function generateMetadata(): Metadata {
  return buildMetadata("/about");
}

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

export default function AboutPage() {
  const { siteUrl } = settingsRepo.getSeo();
  const a = settingsRepo.getAbout();
  const home = settingsRepo.getHome();
  const products = productsRepo.list();

  return (
    <>
      <PageBanner title={a.bannerTitle} subtitle={a.bannerSubtitle} trail={[a.bannerTitle]} label="About us" image={a.image} />

      <section className="sec" id="content">
        <div className="wrap narrow">
          <SectionHead num={1} label={a.label || "Who we are"} />
          <h2 className="h2 rv" style={d(1)}>{a.title}</h2>
          <div className="prose"><Prose text={a.text} from={2} /></div>
          {a.points.length > 0 && <ul className="list two rv" style={d(4)}>{a.points.map((t) => <li key={t}>{t}</li>)}</ul>}
        </div>
      </section>

      <div className="wide cr">
        <Img src={a.image2 || a.image} alt="Interior finished with ERA materials" sizes="(max-width: 1200px) 100vw, 1200px" />
      </div>

      {products.length > 0 && (
        <section className="sec">
          <div className="wrap narrow-l">
            <SectionHead num={2} label="What we do" title="Products for every surface" />
            <div className="svc">
              {products.map((p, i) => (
                <div key={p.slug} className="rv" style={d(i % 2)}>
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                  <Link className="lnk" href={`/products/${p.slug}`}>View product</Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {home.why.length > 0 && (
        <section className="sec alt">
          <div className="wrap narrow-l">
            <SectionHead num={3} label={home.whyLabel || "Why choose us"} title={home.whyTitle} />
            <div className="svc">
              {home.why.map((w, i) => (
                <div key={i} className="rv" style={d(i % 2)}>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap narrow c">
          <SectionHead num={4} label="We can become partners" title="We're here to help – let's take it from here." />
          <Link className="btn rv" href="/contact">Start your project</Link>
        </div>
      </section>

      <JsonLd data={breadcrumbLd(siteUrl, [{ name: "Home", path: "/" }, { name: a.bannerTitle, path: "/about" }])} />
    </>
  );
}
