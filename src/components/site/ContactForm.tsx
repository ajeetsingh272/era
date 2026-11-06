"use client";

import { useActionState } from "react";
import { submitEnquiry } from "@/server/actions/enquiry";
import { keepValuesOnSubmit } from "@/lib/keep-values";

export function ContactForm({ products, preselect }: { products: string[]; preselect: string }) {
  const [state, action, pending] = useActionState(submitEnquiry, undefined);
  const err = state?.errors ?? {};

  if (state?.ok) {
    return <p className="fmsg ok" role="status">{state.message}</p>;
  }

  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="form rv" noValidate>
      <div className="fg2">
        <div className="fld">
          <label htmlFor="c-name">Your name</label>
          <input id="c-name" name="name" autoComplete="name" required aria-invalid={!!err.name} aria-describedby={err.name ? "c-name-e" : undefined} />
          {err.name && <p className="ferr" id="c-name-e">{err.name}</p>}
        </div>
        <div className="fld">
          <label htmlFor="c-contact">Phone or email</label>
          <input id="c-contact" name="contact" autoComplete="tel" required aria-invalid={!!err.contact} aria-describedby={err.contact ? "c-contact-e" : undefined} />
          {err.contact && <p className="ferr" id="c-contact-e">{err.contact}</p>}
        </div>
      </div>

      <div className="fld">
        <label htmlFor="c-product">Product of interest</label>
        <select id="c-product" name="product" defaultValue={products.includes(preselect) ? preselect : ""}>
          <option value="">Not sure yet / several</option>
          {products.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="fld">
        <label htmlFor="c-message">Project details</label>
        <textarea id="c-message" name="message" rows={5} placeholder="Space, size, style, timeline…" />
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="c-website">Leave this empty</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.message && <p className="fmsg err" role="alert">{state.message}</p>}
      <button className="btn" type="submit" disabled={pending}>{pending ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
}
