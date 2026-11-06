import Link from "next/link";
import { Img } from "./Img";
import { InstagramIcon, PinIcon } from "./Icons";
import type { BusinessSettings } from "@/types";

export function SiteFooter({
  business: b,
  products,
  pages = [],
}: {
  business: BusinessSettings;
  products: { slug: string; name: string }[];
  pages?: { slug: string; title: string }[];
}) {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-top">
          <p className="ft-say">Let&apos;s create <span className="ol">beautiful spaces</span> together.</p>
          <Link className="btn" href="/contact">Get a free quote</Link>
        </div>
        <div className="fg">
          <div>
            <Img src="/images/logo.png" alt={b.name} sizes="140px" />
            <p>Premium materials for beautiful spaces. Feel the nature with us.</p>
          </div>
          <div>
            <h3 className="lbl">Explore</h3>
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            {pages.map((p) => <Link key={p.slug} href={`/${p.slug}`}>{p.title}</Link>)}
            <Link href="/contact">Contact Us</Link>
          </div>
          <div>
            <h3 className="lbl">Products</h3>
            <div className="ft-cols">
              {products.map((p) => <Link key={p.slug} href={`/products/${p.slug}`}>{p.name}</Link>)}
            </div>
          </div>
          <div>
            <h3 className="lbl">Contact</h3>
            <address>
              {b.tel && <a href={`tel:${b.tel}`}>{b.phone}</a>}
              {b.email && <a href={`mailto:${b.email}`}>{b.email}</a>}
              <span>{[b.address, b.city, `${b.region} ${b.postalCode}`.trim()].filter(Boolean).join(", ")}</span>
            </address>
            <div className="soc">
              {b.mapsUrl && <a href={b.mapsUrl} target="_blank" rel="noopener" aria-label="Open location in Google Maps"><PinIcon /></a>}
              {b.instagram && <a href={b.instagram} target="_blank" rel="noopener" aria-label={`${b.name} on Instagram`}><InstagramIcon /></a>}
            </div>
          </div>
        </div>
        <div className="cpr">
          <span>© {new Date().getFullYear()} {b.name}. All rights reserved.</span>
          <a href="#main">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
