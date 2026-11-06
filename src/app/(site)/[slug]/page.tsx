import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Img } from "@/components/site/Img";
import { PageBanner } from "@/components/site/PageBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { Prose } from "@/components/site/Prose";
import { pagesRepo } from "@/server/repositories/pages";
import { settingsRepo } from "@/server/repositories/settings";
import { buildMetadata } from "@/server/services/seo";
import { breadcrumbLd } from "@/lib/structured-data";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return pagesRepo.list().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = pagesRepo.getBySlug((await params).slug);
  return p ? buildMetadata(`/${p.slug}`) : {};
}

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

/** Admin-created content page: banner + numbered text/image sections. */
export default async function CustomPage({ params }: Params) {
  const p = pagesRepo.getBySlug((await params).slug);
  if (!p) notFound();
  const { siteUrl } = settingsRepo.getSeo();

  return (
    <>
      <PageBanner title={p.title} subtitle={p.subtitle} trail={[p.title]} image={p.sections.find((s) => s.image)?.image} />

      <div id="content">
        {p.sections.map((s, i) => (
          <section key={i} className={`sec${i % 2 ? " alt" : ""}`}>
            <div className={s.image ? `wrap split${s.imageSide === "right" ? " rev" : ""}` : "wrap narrow"}>
              {s.image && (
                <div className="split-media">
                  <div className="cr frame"><Img src={s.image} alt={s.heading || p.title} sizes="(max-width: 900px) 92vw, 45vw" priority={i === 0} /></div>
                </div>
              )}
              <div>
                <div className={`sh rv${s.image ? "" : " c"}`}>
                  <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading && <h2 className="h2" style={d(1)}>{s.heading}</h2>}
                </div>
                <div className="prose"><Prose text={s.text} from={2} /></div>
                {s.buttonLabel && s.buttonHref && <Link className="btn rv" style={d(3)} href={s.buttonHref}>{s.buttonLabel}</Link>}
              </div>
            </div>
          </section>
        ))}
      </div>

      <JsonLd data={breadcrumbLd(siteUrl, [{ name: "Home", path: "/" }, { name: p.title, path: `/${p.slug}` }])} />
    </>
  );
}
