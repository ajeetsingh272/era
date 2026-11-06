import type { Metadata } from "next";
import { ActionForm, Checkbox, Field, TextArea } from "@/components/admin/Form";
import { saveSeoSettings } from "@/server/actions/admin";
import { settingsRepo } from "@/server/repositories/settings";
import { LIMITS } from "@/lib/seo";

export const metadata: Metadata = { title: "Global SEO" };

export default function GlobalSeoPage() {
  const s = settingsRepo.getSeo();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Global SEO</h1>
          <p>Site-wide defaults, search engine verification, analytics and crawler rules.</p>
        </div>
        <div className="a-actions">
          <a className="a-btn ghost" href="/sitemap.xml" target="_blank" rel="noopener">sitemap.xml ↗</a>
          <a className="a-btn ghost" href="/robots.txt" target="_blank" rel="noopener">robots.txt ↗</a>
        </div>
      </div>

      <ActionForm action={saveSeoSettings}>
        <section className="a-card">
          <fieldset className="a-section">
            <legend>Site identity</legend>
            <div className="a-fields">
              <Field name="siteName" label="Site name" defaultValue={s.siteName} required />
              <Field name="siteUrl" label="Site URL" type="url" defaultValue={s.siteUrl} required hint="Your live domain, e.g. https://www.erainterior.in – used for canonical URLs, sitemap and social links." />
              <Field name="titleTemplate" label="Title template" defaultValue={s.titleTemplate} hint={<>Applied to page titles. <code>%s</code> is replaced by the page name.</>} />
              <Field name="locale" label="Locale" defaultValue={s.locale} hint="e.g. en_IN" />
            </div>
          </fieldset>
        </section>

        <section className="a-card">
          <fieldset className="a-section">
            <legend>Default meta tags</legend>
            <p className="a-section-sub">Used on any page that doesn&apos;t have its own SEO set (Home uses these directly).</p>
            <Field full name="defaultTitle" label="Default title (Home page)" defaultValue={s.defaultTitle} range={[LIMITS.titleMin, LIMITS.titleMax]} />
            <TextArea name="defaultDescription" label="Default meta description" defaultValue={s.defaultDescription} rows={3} range={[LIMITS.descMin, LIMITS.descMax]} />
            <TextArea name="defaultKeywords" label="Default keywords" defaultValue={s.defaultKeywords} rows={2} hint="Comma separated. Low impact on Google, still used by some engines." />
            <div className="a-fields">
              <Field name="defaultOgImage" label="Default social share image" defaultValue={s.defaultOgImage} hint="Shown when links are shared on WhatsApp, Facebook, LinkedIn. Ideal size 1200×630." />
              <Field name="twitterHandle" label="X / Twitter handle" defaultValue={s.twitterHandle} placeholder="@yourbrand" />
            </div>
          </fieldset>
        </section>

        <section className="a-card">
          <fieldset className="a-section">
            <legend>Search engine verification</legend>
            <div className="a-fields">
              <Field name="googleVerification" label="Google Search Console code" defaultValue={s.googleVerification} hint={<>Paste only the <code>content</code> value of the HTML-tag method.</>} />
              <Field name="bingVerification" label="Bing Webmaster code" defaultValue={s.bingVerification} hint={<>The <code>msvalidate.01</code> content value.</>} />
            </div>
          </fieldset>
        </section>

        <section className="a-card">
          <fieldset className="a-section">
            <legend>Analytics</legend>
            <div className="a-fields">
              <Field name="gaMeasurementId" label="Google Analytics 4 ID" defaultValue={s.gaMeasurementId} placeholder="G-XXXXXXXXXX" />
              <Field name="gtmId" label="Google Tag Manager ID" defaultValue={s.gtmId} placeholder="GTM-XXXXXXX" hint="Use either GA4 or GTM (GTM can load GA4 itself)." />
            </div>
          </fieldset>
        </section>

        <section className="a-card">
          <fieldset className="a-section">
            <legend>Crawling &amp; indexing</legend>
            <Checkbox
              name="allowIndexing"
              label="Allow search engines to index this website"
              defaultChecked={s.allowIndexing}
              hint="Turn off only for a staging/test site. When off, every page gets noindex and robots.txt blocks all crawlers."
            />
            <TextArea name="robotsDisallow" label="Extra robots.txt Disallow paths" mono defaultValue={s.robotsDisallow} rows={3} hint="One path per line, e.g. /private. /admin is always blocked." />
          </fieldset>
        </section>
      </ActionForm>
    </>
  );
}
