"use client";

import { ActionForm, Checkbox, Field, TextArea } from "./Form";
import { ImageField } from "./ImageField";
import { RepeaterField, type RepeaterFieldDef } from "./RepeaterField";
import { toLines } from "@/lib/text-lists";
import type { FormState } from "@/lib/validation";
import type { AboutContent, CustomPage, HomeContent } from "@/types";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

const TEXT_HINT = "Leave an empty line between paragraphs. Start lines with “- ” to make a bullet list.";
const LINK_HINT = "Page link, e.g. /products/stone, /contact or https://…";

const LINK_CARD: RepeaterFieldDef[] = [
  { key: "title", label: "Title" },
  { key: "href", label: "Link", placeholder: "/products/…", hint: LINK_HINT },
  { key: "text", label: "Text", full: true },
  { key: "image", label: "Image", type: "image" },
];
const TEXT_ITEM: RepeaterFieldDef[] = [
  { key: "title", label: "Title" },
  { key: "text", label: "Text", full: true },
];

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="a-card">
      <fieldset className="a-section">
        <legend>{title}</legend>
        {sub && <p className="a-section-sub">{sub}</p>}
        {children}
      </fieldset>
    </section>
  );
}

export function HomeContentForm({ content: h, action }: { content: HomeContent; action: Action }) {
  return (
    <ActionForm action={action}>
      <Card title="Hero (top of the page)">
        <div className="a-fields">
          <Field name="heroLabel" label="Small label" defaultValue={h.heroLabel} />
          <Field name="heroTitle" label="Big headline" defaultValue={h.heroTitle} required />
        </div>
        <TextArea name="heroText" label="Intro text" rows={2} defaultValue={h.heroText} />
        <ImageField name="heroImage" label="Hero image" defaultValue={h.heroImage} hint="First picture of the slideshow, shown with the headline above." />
        <RepeaterField name="slides" label="More slides" itemTitle="Slide" addLabel="+ Add slide" max={12} defaultValue={h.slides} fields={LINK_CARD} hint="Shown after the headline slide, each with its own title, text, link and image. Tall or landscape photos both work." />
      </Card>

      <Card title="About section">
        <div className="a-fields">
          <Field name="aboutLabel" label="Small label" defaultValue={h.aboutLabel} />
          <Field name="aboutTitle" label="Heading" defaultValue={h.aboutTitle} />
        </div>
        <TextArea name="aboutText" label="Text" rows={5} defaultValue={h.aboutText} hint={TEXT_HINT} />
        <TextArea name="aboutPoints" label="Highlights (tick list)" rows={4} defaultValue={toLines(h.aboutPoints)} hint="One per line." />
        <div className="a-fields">
          <ImageField name="aboutImage" label="Large image" defaultValue={h.aboutImage} />
          <ImageField name="aboutImage2" label="Small image" defaultValue={h.aboutImage2} />
        </div>
      </Card>

      <Card title="What we offer (image tiles)">
        <div className="a-fields">
          <Field name="offerLabel" label="Small label" defaultValue={h.offerLabel} />
          <Field name="offerTitle" label="Heading" defaultValue={h.offerTitle} />
        </div>
        <TextArea name="offerText" label="Intro text" rows={2} defaultValue={h.offerText} />
        <RepeaterField name="tiles" label="Tiles" itemTitle="Tile" addLabel="+ Add tile" max={12} defaultValue={h.tiles} fields={LINK_CARD} />
      </Card>

      <Card title="Why choose us">
        <div className="a-fields">
          <Field name="whyLabel" label="Small label" defaultValue={h.whyLabel} />
          <Field name="whyTitle" label="Heading" defaultValue={h.whyTitle} />
        </div>
        <RepeaterField name="why" label="Reasons" itemTitle="Reason" addLabel="+ Add reason" max={12} defaultValue={h.why} fields={TEXT_ITEM} />
      </Card>

      <Card title="How it works">
        <div className="a-fields">
          <Field name="stepsLabel" label="Small label" defaultValue={h.stepsLabel} />
          <Field name="stepsTitle" label="Heading" defaultValue={h.stepsTitle} />
        </div>
        <RepeaterField name="steps" label="Steps" itemTitle="Step" addLabel="+ Add step" max={8} defaultValue={h.steps} fields={TEXT_ITEM} />
      </Card>

      <Card title="Closing call-to-action">
        <Field name="ctaTitle" label="Heading" defaultValue={h.ctaTitle} full />
        <TextArea name="ctaText" label="Text" rows={2} defaultValue={h.ctaText} />
        <ImageField name="ctaImage" label="Background image" defaultValue={h.ctaImage} />
      </Card>
    </ActionForm>
  );
}

export function AboutContentForm({ content: a, action }: { content: AboutContent; action: Action }) {
  return (
    <ActionForm action={action}>
      <Card title="Banner">
        <div className="a-fields">
          <Field name="bannerTitle" label="Page title" defaultValue={a.bannerTitle} required />
          <Field name="bannerSubtitle" label="Subtitle" defaultValue={a.bannerSubtitle} />
        </div>
      </Card>
      <Card title="Main content">
        <div className="a-fields">
          <Field name="label" label="Small label" defaultValue={a.label} />
          <Field name="title" label="Heading" defaultValue={a.title} />
        </div>
        <TextArea name="text" label="Text" rows={7} defaultValue={a.text} hint={TEXT_HINT} />
        <TextArea name="points" label="Highlights (tick list)" rows={5} defaultValue={toLines(a.points)} hint="One per line." />
        <div className="a-fields">
          <ImageField name="image" label="Large image" defaultValue={a.image} />
          <ImageField name="image2" label="Small image" defaultValue={a.image2} />
        </div>
      </Card>
    </ActionForm>
  );
}

const SECTION: RepeaterFieldDef[] = [
  { key: "heading", label: "Heading" },
  {
    key: "imageSide",
    label: "Image position",
    type: "select",
    options: [
      { value: "right", label: "Image on the right" },
      { value: "left", label: "Image on the left" },
    ],
  },
  { key: "text", label: "Text", type: "textarea", rows: 6, hint: TEXT_HINT },
  { key: "image", label: "Image (optional)", type: "image" },
  { key: "buttonLabel", label: "Button text (optional)", placeholder: "e.g. Get a quote" },
  { key: "buttonHref", label: "Button link", placeholder: "/contact", hint: LINK_HINT },
];

export function PageForm({ page: p, action }: { page: CustomPage | null; action: Action }) {
  return (
    <ActionForm action={action} submitLabel={p ? "Save page" : "Create page"}>
      <Card title="Page">
        <div className="a-fields">
          <Field name="title" label="Page title" defaultValue={p?.title} required />
          <Field name="slug" label="Page address" defaultValue={p?.slug} required hint="Lowercase and hyphens, e.g. our-projects → /our-projects" />
          <Field name="subtitle" label="Subtitle (under the title)" defaultValue={p?.subtitle} full />
          <Field name="sortOrder" label="Menu order" type="number" defaultValue={p?.sortOrder ?? 10} hint="Lower numbers appear first." />
          <div className="a-field">
            <Checkbox name="published" label="Published (visible on the website)" defaultChecked={p ? p.published : true} />
            <Checkbox name="showInMenu" label="Show in the top menu and footer" defaultChecked={p?.showInMenu ?? true} />
          </div>
        </div>
      </Card>
      <Card title="Content sections" sub="Each section is a block of text with an optional image beside it. Sections alternate background colours automatically.">
        <RepeaterField
          name="sections"
          label="Sections"
          itemTitle="Section"
          addLabel="+ Add section"
          defaultValue={p?.sections ?? [{ heading: "", text: "", image: "", imageSide: "right", buttonLabel: "", buttonHref: "" }]}
          fields={SECTION}
        />
      </Card>
    </ActionForm>
  );
}
