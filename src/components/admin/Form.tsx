"use client";

import { createContext, useActionState, useContext, useState } from "react";
import type { FormState } from "@/lib/validation";
import { keepValuesOnSubmit } from "@/lib/keep-values";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

const ErrorsCtx = createContext<Record<string, string>>({});

/** Validation error for a field inside an ActionForm (for custom field components). */
export const useFieldError = (name: string): string | undefined => useContext(ErrorsCtx)[name];

/** Server-action form with inline field errors, status message and sticky save bar. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save changes",
  extraActions,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  extraActions?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <ErrorsCtx.Provider value={state?.errors ?? {}}>
      <form action={formAction} onSubmit={keepValuesOnSubmit(formAction)} className="a-form" noValidate>
        {children}
        <div className="a-sticky-save">
          <button className="a-btn" type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
          {extraActions}
          {state?.message && (
            <p className={`a-alert ${state.ok ? "ok" : "err"}`} role={state.ok ? "status" : "alert"}>{state.message}</p>
          )}
        </div>
      </form>
    </ErrorsCtx.Provider>
  );
}

interface FieldProps {
  name: string;
  label: string;
  defaultValue?: string | number;
  hint?: React.ReactNode;
  full?: boolean;
  type?: "text" | "email" | "password" | "number" | "url";
  required?: boolean;
  placeholder?: string;
  /** Show a live character counter with a recommended range. */
  range?: [number, number];
  autoComplete?: string;
}

function Counter({ len, range }: { len: number; range: [number, number] }) {
  const cls = len > range[1] ? "over" : len >= range[0] ? "good" : "";
  return <span className={`a-counter ${cls}`}>{len} / {range[0]}–{range[1]}</span>;
}

export function Field({ name, label, defaultValue = "", hint, full, type = "text", required, placeholder, range, autoComplete }: FieldProps) {
  const err = useContext(ErrorsCtx)[name];
  const [len, setLen] = useState(String(defaultValue).length);
  const id = `f-${name}`;
  return (
    <div className={`a-field${full ? " full" : ""}`}>
      <label htmlFor={id}>{label}{range && <Counter len={len} range={range} />}</label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!err}
        aria-describedby={hint ? `${id}-h` : undefined}
        onChange={range ? (e) => setLen(e.target.value.length) : undefined}
      />
      {hint && <p className="hint" id={`${id}-h`}>{hint}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}

export function TextArea({
  name, label, defaultValue = "", hint, rows = 4, mono, range, full = true, placeholder,
}: Omit<FieldProps, "type"> & { rows?: number; mono?: boolean }) {
  const err = useContext(ErrorsCtx)[name];
  const [len, setLen] = useState(String(defaultValue).length);
  const id = `f-${name}`;
  return (
    <div className={`a-field${full ? " full" : ""}`}>
      <label htmlFor={id}>{label}{range && <Counter len={len} range={range} />}</label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={mono ? "mono" : undefined}
        aria-invalid={!!err}
        onChange={range ? (e) => setLen(e.target.value.length) : undefined}
      />
      {hint && <p className="hint">{hint}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <div className="a-field full">
      <label className="a-check">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        <span>{label}{hint && <span className="hint" style={{ display: "block", fontWeight: 400 }}>{hint}</span>}</span>
      </label>
    </div>
  );
}
