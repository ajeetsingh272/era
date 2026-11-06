import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Img } from "@/components/site/Img";
import { PageBanner } from "@/components/site/PageBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { SectionHead } from "@/components/site/Display";
import { productsRepo } from "@/server/repositories/products";
import { settingsRepo } from "@/server/repositories/settings";
import { buildMetadata } from "@/server/services/seo";
import { breadcrumbLd, faqLd, productLd } from "@/lib/structured-data";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return productsRepo.list().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = productsRepo.getBySlug(slug);
  if (!p) return {};
  return buildMetadata(`/products/${p.slug}`);
}

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;
const quote = (name: string) => `/contact?product=${encodeURIComponent(name)}`;

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const p = productsRepo.getBySlug(slug);
  if (!p) notFound();

  const all = productsRepo.list();
  const i = all.findIndex((x) => x.id === p.id);
  const prev = all[(i + all.length - 1) % all.length];
  const next = all[(i + 1) % all.length];
  const { content: c } = p;
  const { siteUrl, siteName } = settingsRepo.getSeo();
  const path = `/products/${p.slug}`;
  let n = 0;

  return (
    <>
      <PageBanner title={p.name} subtitle={p.tagline} trail={["Products", p.name]} label="Product" image={p.heroImage} />

      <section className="sec" id="content">
        <div className="wrap split">
          <div className="split-media">
            <div className="cr frame"><Img src={p.heroImage} alt={p.name} sizes="(max-width: 900px) 92vw, 45vw" priority /></div>
            {p.swatchImage && <div className="cr inset"><Img src={p.swatchImage} alt={`${p.name} colour samples`} sizes="(max-width: 900px) 45vw, 20vw" /></div>}
          </div>
          <div>
            <SectionHead num={++n} label="Overview" center={false} />
            <h2 className="h2 rv" style={d(1)}>About {p.name}</h2>
            <div className="prose">
              {c.overview && <p className="rv" style={d(2)}>{c.overview}</p>}
              <p className="rv" style={d(3)}>{p.description}</p>
            </div>
            <div className="btns rv" style={d(4)}>
              <Link className="btn" href={quote(p.name)}>Enquire about this</Link>
              {c.types.length > 0 && <a className="lnk" href="#types">See all types</a>}
            </div>
          </div>
        </div>
      </section>

      {c.gallery.length > 0 && (
        <section className="sec alt">
          <div className="wrap">
            <SectionHead num={++n} label="Gallery" title={`${p.name} in real spaces`} />
            <div className="gal" data-zoom-group>
              {c.gallery.map((g, k) => (
                <a key={g} className="cr zoom" href={g} data-zoom data-caption={`${p.name} – installation ${k + 1}`} aria-label={`Enlarge ${p.name} installation photo ${k + 1}`}>
                  <Img src={g} alt={`${p.name} installation ${k + 1}`} sizes="(max-width: 900px) 92vw, 33vw" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.types.length > 0 && (
        <section className="sec" id="types">
          <div className="wrap">
            <SectionHead num={++n} label="Types & quality" title={`Choose the right ${p.name}`} />
            <p className="lead c rv">Swatches are digital renderings that show the look of each type. The real product&apos;s colour and finish can vary a little.</p>
            <div className="cards four types" data-zoom-group>
              {c.types.map((t, k) => (
                <article key={t.name} className="card rv" style={d(k % 4)}>
                  <a className="card-img sq zoom" href={t.image} data-zoom data-caption={`${t.name} – ${p.name}`} aria-label={`Enlarge ${t.name} swatch`}>
                    <Img src={t.image} alt={`${t.name} – ${p.name}`} sizes="(max-width: 600px) 30vw, (max-width: 1000px) 45vw, 23vw" />
                    {t.bestFor && <span className="tag">{t.bestFor.split(",")[0]}</span>}
                  </a>
                  <div className="card-body">
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                  {t.bestFor && <p className="meta">Best for: {t.bestFor}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.features.length > 0 && (
        <section className="sec alt">
          <div className="wrap narrow-l">
            <SectionHead num={++n} label="Key features" title="Why people choose it" />
            <div className="svc">
              {c.features.map((f, k) => (
                <div key={f.title} className="rv" style={d(k % 2)}><h3>{f.title}</h3><p>{f.detail}</p></div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap cols2">
          <div className="rv">
            <SectionHead num={++n} label="Where it works" center={false} />
            <ul className="list">{c.uses.map((u) => <li key={u}>{u}</li>)}</ul>
            {c.varieties.length > 0 && (
              <>
                <p className="lbl sp">Available types</p>
                <div className="chips">{c.varieties.map((v) => <span key={v}>{v}</span>)}</div>
              </>
            )}
          </div>
          <div className="rv" style={d(1)}>
            <SectionHead num={++n} label="Specifications" center={false} />
            <table className="spec">
              <tbody>{c.specs.map((s) => <tr key={s.label}><th scope="row">{s.label}</th><td>{s.value}</td></tr>)}</tbody>
            </table>
            <p className="meta">Options vary by variety. Contact us for exact sizes, thickness and availability.</p>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap cols2">
          <div>
            <SectionHead num={++n} label="Made from & benefits" center={false} />
            <h2 className="h3 rv">What {p.name} is made of</h2>
            <p className="rv prose-p">{c.material.text}</p>
            <div className="chips rv">{c.material.components.map((m) => <span key={m}>{m}</span>)}</div>
          </div>
          <div className="svc one">
            {c.material.benefits.map((b, k) => (
              <div key={b.title} className="rv" style={d(k)}><h3>{b.title}</h3><p>{b.detail}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap narrow">
          <SectionHead num={++n} label="Material guide" title="Know your material" />
          <div className="guide rv">
            <h3>What it is</h3><p>{c.guide.about}</p>
            <h3>How it is made</h3><p>{c.guide.made}</p>
            <h3>Installation tip</h3><p>{c.guide.install}</p>
          </div>
          <div className="cols2 pc">
            <div className="rv"><p className="lbl">Strengths</p><ul className="list">{c.guide.pros.map((v) => <li key={v}>{v}</li>)}</ul></div>
            <div className="rv" style={d(1)}><p className="lbl">Good to know</p><ul className="list minus">{c.guide.cons.map((v) => <li key={v}>{v}</li>)}</ul></div>
          </div>
        </div>
      </section>

      {c.guide.faqs.length > 0 && (
        <section className="sec alt">
          <div className="wrap narrow">
            <SectionHead num={++n} label="FAQ" title="Common questions" />
            <div className="faq">
              {c.guide.faqs.map((f) => (
                <details key={f.q} className="rv"><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.care.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SectionHead num={++n} label="Care & maintenance" title="Easy to look after" />
            <ol className="steps">
              {c.care.map((v, k) => (
                <li key={v} className="rv" style={d(k % 4)}>
                  <span className="num sm" aria-hidden="true">{String(k + 1).padStart(2, "0")}</span>
                  <p>{v}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="band">
        <div className="band-bg" aria-hidden="true" data-speed="-0.25"><Img src={p.heroImage} alt="" sizes="100vw" /></div>
        <div className="wrap band-in rv">
          <p className="lbl c">Get a quote</p>
          <h2 className="h2">Interested in {p.name}?</h2>
          <p className="lead c">Share your space and we will suggest the right options and a quote.</p>
          <Link className="btn" href={quote(p.name)}>Get a quote</Link>
        </div>
      </section>

      {all.length > 1 && (
        <nav className="pn" aria-label="More products">
          <Link href={`/products/${prev.slug}`}><span className="lbl">Previous product</span><b>← {prev.name}</b></Link>
          <Link href={`/products/${next.slug}`}><span className="lbl">Next product</span><b>{next.name} →</b></Link>
        </nav>
      )}

      <JsonLd
        data={[
          breadcrumbLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: p.name, path },
          ]),
          productLd(siteUrl, { name: p.name, description: p.description, image: p.heroImage, slug: p.slug }, siteName),
          ...(c.guide.faqs.length ? [faqLd(c.guide.faqs)] : []),
        ]}
      />
    </>
  );
}
