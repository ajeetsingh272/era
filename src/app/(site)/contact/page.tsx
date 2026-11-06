import type { Metadata } from "next";
import { PageBanner } from "@/components/site/PageBanner";
import { ContactForm } from "@/components/site/ContactForm";
import { JsonLd } from "@/components/site/JsonLd";
import { SectionHead } from "@/components/site/Display";
import { buildMetadata } from "@/server/services/seo";
import { settingsRepo } from "@/server/repositories/settings";
import { productsRepo } from "@/server/repositories/products";
import { breadcrumbLd } from "@/lib/structured-data";

export function generateMetadata(): Metadata {
  return buildMetadata("/contact");
}

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product = "" } = await searchParams;
  const { business: b, seo } = settingsRepo.getAll();
  const products = productsRepo.list().map((p) => p.name);
  const handle = b.instagram.replace(/\/+$/, "").split("/").pop();
  const address = [b.address, b.city, b.region, b.postalCode].filter(Boolean).join(", ");

  return (
    <>
      <PageBanner
        title="Have a project in mind? | Write us a message."
        subtitle="Share your space, style and budget – we will suggest the right materials and a clear quote."
        trail={["Contact Us"]}
        label="Contact"
      />

      <section className="sec" id="content">
        <div className="wrap info">
          <div className="rv">
            <span className="num" aria-hidden="true">01</span>
            <p className="lbl c">Location</p>
            <p>{address}</p>
            {b.mapsUrl && <a className="lnk" href={b.mapsUrl} target="_blank" rel="noopener">Open in Google Maps</a>}
          </div>
          <div className="rv" style={d(1)}>
            <span className="num" aria-hidden="true">02</span>
            <p className="lbl c">Contact</p>
            {b.tel && <p><a href={`tel:${b.tel}`}>{b.phone}</a></p>}
            {b.email && <p><a href={`mailto:${b.email}`}>{b.email}</a></p>}
            {b.whatsapp && <a className="lnk" href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noopener">Chat on WhatsApp</a>}
          </div>
          {b.instagram && (
            <div className="rv" style={d(2)}>
              <span className="num" aria-hidden="true">03</span>
              <p className="lbl c">Follow</p>
              <p>See our latest installations</p>
              <a className="lnk" href={b.instagram} target="_blank" rel="noopener">@{handle}</a>
            </div>
          )}
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap narrow">
          <SectionHead num={b.instagram ? 4 : 3} label="Send an enquiry" title="Tell us about your project" />
          <ContactForm products={products} preselect={product} />
        </div>
      </section>

      <JsonLd data={breadcrumbLd(seo.siteUrl, [{ name: "Home", path: "/" }, { name: "Contact Us", path: "/contact" }])} />
    </>
  );
}
