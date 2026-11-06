import type { Metadata, Viewport } from "next";
import { Poppins, Roboto } from "next/font/google";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteEffects } from "@/components/site/SiteEffects";
import { Motion } from "@/components/site/Motion";
import { Lightbox } from "@/components/site/Lightbox";
import { QuickContact } from "@/components/site/QuickContact";
import { Analytics } from "@/components/site/Analytics";
import { JsonLd } from "@/components/site/JsonLd";
import { productsRepo } from "@/server/repositories/products";
import { pagesRepo } from "@/server/repositories/pages";
import { settingsRepo } from "@/server/repositories/settings";
import { localBusinessLd, websiteLd } from "@/lib/structured-data";
import "@/styles/site.css";

const display = Poppins({ weight: ["600", "700", "800"], subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Roboto({ weight: ["300", "400", "500"], subsets: ["latin"], variable: "--font-body", display: "swap" });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f6f7f5" };

export function generateMetadata(): Metadata {
  const seo = settingsRepo.getSeo();
  return {
    metadataBase: new URL(seo.siteUrl),
    applicationName: seo.siteName,
    verification: {
      google: seo.googleVerification || undefined,
      other: seo.bingVerification ? { "msvalidate.01": seo.bingVerification } : undefined,
    },
    formatDetection: { telephone: true },
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { business, seo } = settingsRepo.getAll();
  const products = productsRepo.list().map(({ slug, name, heroImage }) => ({ slug, name, heroImage }));
  const menuPages = pagesRepo.list().filter((p) => p.showInMenu).map(({ slug, title }) => ({ slug, title }));

  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal animations only when JS runs, so crawlers and no-JS users always see content. */}
        <script
          dangerouslySetInnerHTML={{
            // js: enables reveal animations. no-pl: the preloader shows once per visit, not on every page load.
            __html:
              "var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('era-pl'))d.classList.add('no-pl');sessionStorage.setItem('era-pl','1')}catch(e){}",
          }}
        />
      </head>
      <body>
        <a className="sr-only" href="#main">Skip to content</a>
        {/* Preloader: only shown when JS runs (see .js .pl in site.css), dismissed by <Motion />. */}
        <div id="pl" className="pl" aria-hidden="true">
          <div className="pl-in">
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny logo, must paint before hydration */}
            <img src="/images/logo.png" alt="" width={120} height={77} />
            <span className="pl-bar"><i /></span>
            <span className="pl-txt">Please wait</span>
          </div>
        </div>
        <SiteNav
          products={products}
          pages={menuPages}
          logo="/images/logo.png"
          contact={{ phone: business.phone, tel: business.tel, email: business.email, address: [business.address, business.city].filter(Boolean).join(", "), instagram: business.instagram, whatsapp: business.whatsapp }}
        />
        <main id="main">{children}</main>
        <SiteFooter business={business} products={products} pages={menuPages} />
        <SiteEffects />
        <Motion />
        <Lightbox />
        <QuickContact whatsapp={business.whatsapp} tel={business.tel} phone={business.phone} />
        <JsonLd data={[localBusinessLd(business, seo), websiteLd(seo)]} />
        <Analytics gaId={seo.gaMeasurementId} gtmId={seo.gtmId} />
      </body>
    </html>
  );
}
