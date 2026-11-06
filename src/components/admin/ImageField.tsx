"use client";

import { useState } from "react";
import { useFieldError } from "./Form";
import { MediaPicker } from "./MediaPicker";

const isImagePath = (v: string) => v.startsWith("/") || /^https?:\/\//.test(v);
const fileName = (v: string) => decodeURIComponent(v.split("?")[0].split("/").pop() ?? v);

/** Controlled image picker: thumbnail + Choose/Replace (opens the media popup) + Remove. */
export function ImageInput({ id, name, value, onChange, invalid }: { id: string; name?: string; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [changed, setChanged] = useState(false);
  const set = (v: string) => {
    onChange(v);
    setChanged(true);
  };

  return (
    <div className="a-image-row">
      <button type="button" className="a-preview" onClick={() => setOpen(true)} aria-label={value ? "Replace image" : "Choose image"}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, any URL */}
        {isImagePath(value) ? <img src={value} alt="" /> : <span>+ Add image</span>}
      </button>
      <div className="a-image-ctrl">
        <span className="a-upload">
          <button id={id} type="button" className={`a-btn ghost sm${invalid ? " danger" : ""}`} onClick={() => setOpen(true)}>
            {value ? "Replace image" : "Choose image"}
          </button>
          {value && <button type="button" className="a-btn ghost sm" onClick={() => set("")}>Remove</button>}
        </span>
        <span className="a-image-name" title={value}>{value ? fileName(value) : "No image selected"}</span>
        {changed && <span className="a-image-note" role="status">Image changed – click Save to publish.</span>}
        {name && <input type="hidden" name={name} value={value} />}
      </div>
      {open && <MediaPicker onSelect={set} onClose={() => setOpen(false)} />}
    </div>
  );
}

/** Form field version of ImageInput (value is submitted with the surrounding ActionForm). */
export function ImageField({ name, label, defaultValue = "", hint }: { name: string; label: string; defaultValue?: string; hint?: string }) {
  const [value, setValue] = useState(defaultValue);
  const err = useFieldError(name);
  const id = `f-${name}`;

  return (
    <div className="a-field full a-image-field">
      <label htmlFor={id}>{label}</label>
      <ImageInput id={id} name={name} value={value} onChange={setValue} invalid={!!err} />
      {hint && <p className="hint">{hint}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
