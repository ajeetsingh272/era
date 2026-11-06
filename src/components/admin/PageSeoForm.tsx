"use client";

import { useState } from "react";
import { ActionForm, Checkbox, Field, TextArea } from "./Form";
import { LIMITS, absoluteUrl, resolvePageSeo, scoreSeo, type SeoFallback } from "@/lib/seo";
import type { FormState } from "@/lib/validation";
import type { PageSeo, SeoSettings } from "@/types";

interface Props {
  path: string;
  override: PageSeo | null;
  settings: SeoSettings;
  fallback: SeoFallback;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}

const EMPTY = { title: "", description: "", keywords: "", ogImage: "", canonical: "", noindex: false };

export function PageSeoForm({ path, override, settings, fallback, action }: Props) {
  const [v, setV] = useState({ ...EMPTY, ...(override ?? {}) });
  const [focus, setFocus] = useState("");

  // Live preview uses the exact same resolution logic as the public site.
  const resolved = resolvePageSeo(path, settings, { ...v, path, updatedAt: "" }, fallback);
  const audit = scoreSeo(resolved, focus);
  const auto = resolvePageSeo(path, settings, null, fallback);

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    const t = e.target as HTMLInputElement;
    if (t.name in EMPTY) setV((s) => ({ ...s, [t.name]: t.type === "checkbox" ? t.checked : t.value }));
  };

  return (
    <div className="a-grid cols-2" style={{ alignItems: "start" }}>
      <div onInput={onInput}>
        <ActionForm action={action}>
          <input type="hidden" name="path" value={path} />
          <section className="a-card">
            <fieldset className="a-section">
              <legend>Search result</legend>
              <p className="a-section-sub">Leave a field empty to use the automatic value shown as placeholder.</p>
              <Field full name="title" label="SEO title" defaultValue={override?.title} placeholder={auto.title} range={[LIMITS.titleMin, LIMITS.titleMax]} hint="Used exactly as typed (the site template is not added)." />
              <TextArea name="description" label="Meta description" rows={3} defaultValue={override?.description} placeholder={auto.description} range={[LIMITS.descMin, LIMITS.descMax]} />
              <Field full name="keywords" label="Keywords" defaultValue={override?.keywords} placeholder={auto.keywords} hint="Comma separated." />
            </fieldset>
          </section>
          <section className="a-card">
            <fieldset className="a-section">
              <legend>Social sharing &amp; advanced</legend>
              <Field full name="ogImage" label="Social share image" defaultValue={override?.ogImage} placeholder={fallback.image || settings.defaultOgImage} hint="Path like /images/cov.jpg or https:// URL. 1200×630 works best." />
              <Field full name="canonical" label="Canonical URL" defaultValue={override?.canonical} placeholder={absoluteUrl(settings.siteUrl, path)} hint="Only change if this content's main version lives at another URL." />
              <Checkbox name="noindex" label="Hide this page from search engines (noindex)" defaultChecked={override?.noindex} hint="Also removes it from sitemap.xml." />
            </fieldset>
          </section>
        </ActionForm>
      </div>

      <div style={{ position: "sticky", top: 20, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 18 }}>
        <section className="a-card">
          <div className="a-card-head"><h2>Google preview</h2><span className={`a-badge ${audit.level}`}>Score {audit.score}/100</span></div>
          <div className="a-serp">
            <div className="u">{resolved.canonical.replace(/^https?:\/\//, "").replace(/\//g, " › ").replace(/ › $/, "")}</div>
            <div className="t">{resolved.title}</div>
            <div className="d">{resolved.description}</div>
          </div>
          <div className="a-field" style={{ marginTop: 16 }}>
            <label htmlFor="focus">Main keyword to check (optional)</label>
            <input id="focus" type="text" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. wooden flooring Ahmedabad" />
          </div>
          {audit.issues.length > 0 ? (
            <ul className="a-issues" style={{ marginTop: 14 }}>
              {audit.issues.map((i) => <li key={i.message} className={i.level}>{i.message}</li>)}
            </ul>
          ) : (
            <p className="a-alert ok" style={{ marginTop: 14 }}>Looks great – no issues found.</p>
          )}
        </section>
        <section className="a-card">
          <div className="a-card-head"><h2>Social preview</h2></div>
          <div className="a-og">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolved.ogImage.replace(settings.siteUrl, "")} alt="" />
            <div>
              <span className="muted">{settings.siteUrl.replace(/^https?:\/\//, "")}</span>
              <b>{resolved.title}</b>
              <span className="muted">{resolved.description.slice(0, 110)}{resolved.description.length > 110 ? "…" : ""}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

