"use client";

import { ActionForm, Checkbox, Field, TextArea } from "./Form";
import { ImageField } from "./ImageField";
import { RepeaterField } from "./RepeaterField";
import { toLines, toRows } from "@/lib/text-lists";
import type { FormState } from "@/lib/validation";
import type { Product } from "@/types";

const PIPE_HINT = "One per line. Separate columns with | (vertical bar).";

export function ProductForm({ product, action }: { product: Product | null; action: (prev: FormState, fd: FormData) => Promise<FormState> }) {
  const p = product;
  const c = p?.content;

  return (
    <ActionForm action={action} submitLabel={p ? "Save product" : "Create product"}>
      <section className="a-card">
        <fieldset className="a-section">
          <legend>Basics</legend>
          <div className="a-fields">
            <Field name="name" label="Product name" defaultValue={p?.name} required />
            <Field name="slug" label="URL slug" defaultValue={p?.slug} required hint="Page address: /products/<slug>. Changing it changes the URL." />
            <Field name="tagline" label="Tagline" defaultValue={p?.tagline} full />
            <TextArea name="description" label="Short description" defaultValue={p?.description} rows={3} hint="Shown in the overview and used as the default meta description." />
            <ImageField name="heroImage" label="Main image" defaultValue={p?.heroImage} hint="Large photo at the top of the page; also used for search & social sharing." />
            <ImageField name="swatchImage" label="Colour samples image" defaultValue={p?.swatchImage} hint="Smaller image beside the main one." />
            <Field name="sortOrder" label="Menu order" type="number" defaultValue={p?.sortOrder ?? 99} hint="Lower numbers appear first." />
            <Checkbox name="published" label="Published (visible on the website)" defaultChecked={p ? p.published : true} />
          </div>
        </fieldset>
      </section>

      <section className="a-card">
        <fieldset className="a-section">
          <legend>Overview &amp; features</legend>
          <TextArea name="overview" label="Overview paragraph" defaultValue={c?.overview} rows={4} />
          <TextArea name="features" label="Key features" mono defaultValue={toRows(c?.features.map((f) => [f.title, f.detail]) ?? [])} hint={`${PIPE_HINT} Format: Title | Detail`} />
          <div className="a-fields">
            <TextArea full={false} name="uses" label="Where it works" defaultValue={toLines(c?.uses ?? [])} hint="One per line." />
            <TextArea full={false} name="varieties" label="Available types (list)" defaultValue={toLines(c?.varieties ?? [])} hint="One per line. Optional." />
          </div>
          <TextArea name="specs" label="Specifications" mono defaultValue={toRows(c?.specs.map((s) => [s.label, s.value]) ?? [])} hint={`${PIPE_HINT} Format: Label | Value`} />
          <TextArea name="care" label="Care & maintenance tips" defaultValue={toLines(c?.care ?? [])} hint="One per line." />
        </fieldset>
      </section>

      <section className="a-card">
        <fieldset className="a-section">
          <legend>Types, swatches &amp; gallery</legend>
          <RepeaterField
            name="types"
            label="Types & quality"
            itemTitle="Type"
            addLabel="+ Add type"
            defaultValue={c?.types ?? []}
            fields={[
              { key: "name", label: "Name" },
              { key: "bestFor", label: "Best for", placeholder: "e.g. Living rooms, offices" },
              { key: "description", label: "Description", type: "textarea", rows: 2 },
              { key: "image", label: "Swatch image", type: "image" },
            ]}
          />
          <RepeaterField
            name="gallery"
            label="Gallery images"
            itemTitle="Photo"
            addLabel="+ Add photo"
            defaultValue={(c?.gallery ?? []).map((image) => ({ image }))}
            fields={[{ key: "image", label: "Image", type: "image" }]}
            hint="Optional. Photos of the product in real spaces."
          />
        </fieldset>
      </section>

      <section className="a-card">
        <fieldset className="a-section">
          <legend>Material &amp; benefits</legend>
          <TextArea name="materialText" label="What it is made of" defaultValue={c?.material.text} rows={3} />
          <TextArea name="materialComponents" label="Components (chips)" defaultValue={toLines(c?.material.components ?? [])} hint="One per line." />
          <TextArea name="materialBenefits" label="Benefits" mono defaultValue={toRows(c?.material.benefits.map((b) => [b.title, b.detail]) ?? [])} hint={`${PIPE_HINT} Format: Title | Detail`} />
        </fieldset>
      </section>

      <section className="a-card">
        <fieldset className="a-section">
          <legend>Material guide &amp; FAQ</legend>
          <p className="a-section-sub">FAQs are also published as FAQ structured data, which can show as rich results in Google.</p>
          <div className="a-fields">
            <TextArea full={false} name="guideAbout" label="What it is" defaultValue={c?.guide.about} rows={3} />
            <TextArea full={false} name="guideMade" label="How it is made" defaultValue={c?.guide.made} rows={3} />
          </div>
          <TextArea name="guideInstall" label="Installation tip" defaultValue={c?.guide.install} rows={2} />
          <div className="a-fields">
            <TextArea full={false} name="guidePros" label="Strengths" defaultValue={toLines(c?.guide.pros ?? [])} hint="One per line." />
            <TextArea full={false} name="guideCons" label="Good to know" defaultValue={toLines(c?.guide.cons ?? [])} hint="One per line." />
          </div>
          <TextArea name="guideFaqs" label="FAQs" mono rows={6} defaultValue={toRows(c?.guide.faqs.map((f) => [f.q, f.a]) ?? [])} hint={`${PIPE_HINT} Format: Question | Answer`} />
        </fieldset>
      </section>
    </ActionForm>
  );
}
