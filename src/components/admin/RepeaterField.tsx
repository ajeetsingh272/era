"use client";

import { useState } from "react";
import { useFieldError } from "./Form";
import { ImageInput } from "./ImageField";

type Item = Record<string, string>;

/** Stable React keys for list rows (only used client-side, so a module counter is fine). */
let keySeq = 0;

export interface RepeaterFieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  rows?: number;
  /** Span the full width of the item card. */
  full?: boolean;
}

/**
 * Editable list of items (slides, tiles, page sections…): add, remove, reorder.
 * Submitted as one hidden JSON field named `name`; the server validates it with zod.
 */
export function RepeaterField({
  name,
  label,
  hint,
  fields,
  defaultValue,
  addLabel = "+ Add item",
  itemTitle = "Item",
  max = 40,
}: {
  name: string;
  label: string;
  hint?: string;
  fields: RepeaterFieldDef[];
  defaultValue: object[];
  addLabel?: string;
  itemTitle?: string;
  max?: number;
}) {
  const err = useFieldError(name);
  const withKey = (v: Item) => ({ _k: keySeq++, v });
  const empty = (): Item => Object.fromEntries(fields.map((f) => [f.key, f.type === "select" ? (f.options?.[0]?.value ?? "") : ""]));
  const [items, setItems] = useState(() =>
    defaultValue.map((d) => withKey({ ...empty(), ...(d as Record<string, unknown>) } as Item)),
  );

  const update = (i: number, key: string, value: string) =>
    setItems((list) => list.map((it, k) => (k === i ? { ...it, v: { ...it.v, [key]: value } } : it)));
  const move = (i: number, dir: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  const remove = (i: number) => setItems((list) => list.filter((_, k) => k !== i));
  const add = () => setItems((list) => [...list, withKey(empty())]);

  return (
    <div className="a-field full a-repeater">
      <div className="a-repeater-head">
        <span className="a-label">{label}</span>
        <span className="muted">{items.length} {items.length === 1 ? "item" : "items"}</span>
      </div>
      {hint && <p className="hint">{hint}</p>}
      <input type="hidden" name={name} value={JSON.stringify(items.map((it) => it.v))} />

      {items.map((it, i) => {
        const titleField = fields.find((f) => f.type !== "image" && f.type !== "select");
        const summary = titleField ? it.v[titleField.key] : "";
        return (
          <fieldset key={it._k} className="a-rep-item">
            <legend className="a-rep-bar">
              <b>{itemTitle} {i + 1}</b>
              {summary && <span className="muted"> – {summary.slice(0, 60)}</span>}
            </legend>
            <div className="a-rep-tools">
              <button type="button" className="a-btn ghost sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${itemTitle} ${i + 1} up`}>↑</button>
              <button type="button" className="a-btn ghost sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${itemTitle} ${i + 1} down`}>↓</button>
              <button type="button" className="a-btn danger sm" onClick={() => remove(i)} aria-label={`Remove ${itemTitle} ${i + 1}`}>Remove</button>
            </div>
            <div className="a-fields">
              {fields.map((f) => {
                const id = `${name}-${it._k}-${f.key}`;
                const value = it.v[f.key] ?? "";
                const set = (v: string) => update(i, f.key, v);
                return (
                  <div key={f.key} className={`a-field${f.full || f.type === "textarea" || f.type === "image" ? " full" : ""}`}>
                    <label htmlFor={id}>{f.label}</label>
                    {f.type === "image" ? (
                      <ImageInput id={id} value={value} onChange={set} />
                    ) : f.type === "textarea" ? (
                      <textarea id={id} rows={f.rows ?? 4} value={value} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
                    ) : f.type === "select" ? (
                      <select id={id} value={value} onChange={(e) => set(e.target.value)}>
                        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input id={id} type="text" value={value} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
                    )}
                    {f.hint && <p className="hint">{f.hint}</p>}
                  </div>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {items.length < max && (
        <div>
          <button type="button" className="a-btn ghost" onClick={add}>{addLabel}</button>
        </div>
      )}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
