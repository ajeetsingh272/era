import type { Metadata } from "next";
import { ActionForm, Field } from "@/components/admin/Form";
import { saveBusiness } from "@/server/actions/admin";
import { changePassword } from "@/server/actions/auth";
import { settingsRepo } from "@/server/repositories/settings";

export const metadata: Metadata = { title: "Business & account" };

export default function SettingsPage() {
  const b = settingsRepo.getBusiness();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Business &amp; account</h1>
          <p>Contact details shown on the website and in Google&apos;s local business data.</p>
        </div>
      </div>

      <ActionForm action={saveBusiness}>
        <section className="a-card">
          <fieldset className="a-section">
            <legend>Business details</legend>
            <div className="a-fields">
              <Field name="name" label="Business name" defaultValue={b.name} required />
              <Field name="email" label="Email" type="email" defaultValue={b.email} hint="Leave empty to hide email on the website." />
              <Field name="phone" label="Phone (as displayed)" defaultValue={b.phone} />
              <Field name="tel" label="Phone (for tap-to-call)" defaultValue={b.tel} hint="International format, e.g. +919898358156" />
              <Field name="whatsapp" label="WhatsApp number" defaultValue={b.whatsapp} hint="Digits with country code, e.g. 919898358156. Empty hides it." />
            </div>
          </fieldset>
        </section>
        <section className="a-card">
          <fieldset className="a-section">
            <legend>Address</legend>
            <div className="a-fields">
              <Field full name="address" label="Street address" defaultValue={b.address} />
              <Field name="city" label="City" defaultValue={b.city} />
              <Field name="region" label="State" defaultValue={b.region} />
              <Field name="postalCode" label="PIN code" defaultValue={b.postalCode} />
              <Field name="country" label="Country code" defaultValue={b.country} hint="Two letters, e.g. IN" />
              <Field full name="mapsUrl" label="Google Maps link" defaultValue={b.mapsUrl} />
            </div>
          </fieldset>
        </section>
        <section className="a-card">
          <fieldset className="a-section">
            <legend>Social profiles</legend>
            <div className="a-fields">
              <Field name="instagram" label="Instagram URL" defaultValue={b.instagram} />
              <Field name="facebook" label="Facebook URL" defaultValue={b.facebook} />
            </div>
          </fieldset>
        </section>
      </ActionForm>

      <div style={{ marginTop: 28 }}>
        <ActionForm action={changePassword} submitLabel="Change password">
          <section className="a-card">
            <fieldset className="a-section">
              <legend>Change admin password</legend>
              <div className="a-fields">
                <Field name="current" label="Current password" type="password" autoComplete="current-password" />
                <Field name="next" label="New password" type="password" autoComplete="new-password" hint="At least 10 characters." />
                <Field name="confirm" label="Confirm new password" type="password" autoComplete="new-password" />
              </div>
            </fieldset>
          </section>
        </ActionForm>
      </div>
    </>
  );
}
