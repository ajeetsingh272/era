"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { listMedia, uploadImage } from "@/server/actions/admin";
import type { MediaItem } from "@/types";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024; // same limit as the server
const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;

type Tab = "upload" | "library";

/**
 * Media picker popup (native <dialog>: focus trap, Esc to close, accessible by default).
 * Upload tab: drag & drop / browse / paste, preview, validation, then upload.
 * Library tab: pick any previously uploaded or built-in image.
 * Mount it only while open – it opens itself and resets on every use.
 */
export function MediaPicker({
  onSelect,
  onClose,
  title = "Choose an image",
  uploadOnly = false,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
  title?: string;
  /** Hide the library tab (e.g. when already on the Media library page). */
  uploadOnly?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState("");
  const [library, setLibrary] = useState<MediaItem[] | null>(null);
  const [picked, setPicked] = useState("");
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);
  // Free the local preview URL when it changes or the popup closes.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const choose = (f: File | undefined | null) => {
    if (!f) return;
    setError("");
    if (!TYPES.includes(f.type)) return setError(`“${f.name}” is not a supported image. Use JPG, PNG, WebP or AVIF.`);
    if (f.size > MAX_BYTES) return setError(`“${f.name}” is ${mb(f.size)} – the maximum is 8 MB.`);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const finish = (url: string) => {
    onSelect(url);
    dialog.current?.close();
  };

  const upload = () => {
    if (!file) return;
    start(async () => {
      const fd = new FormData();
      fd.set("file", file);
      try {
        const res = await uploadImage(fd);
        if (res.ok) finish(res.path);
        else setError(res.error);
      } catch {
        setError("Upload failed. Check your connection, reload the page (Ctrl+F5) and try again.");
      }
    });
  };

  const openLibrary = () => {
    setTab("library");
    if (library) return;
    start(async () => {
      try {
        setLibrary(await listMedia());
      } catch {
        setError("Could not load the media library. Reload the page and try again.");
      }
    });
  };

  const useLink = () => {
    const v = link.trim();
    if (!/^https:\/\/\S+$/i.test(v)) return setError("Paste a full image link starting with https://");
    finish(v);
  };

  const shown = (library ?? []).filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));

  return createPortal(
    <dialog
      ref={dialog}
      className="a-modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()} // click on backdrop
      onPaste={(e) => tab === "upload" && choose(e.clipboardData.files[0])}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT" && e.preventDefault()}
    >
      <div className="a-modal-box">
        <header className="a-modal-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="a-modal-x" aria-label="Close" onClick={() => dialog.current?.close()}>×</button>
        </header>

        <div className="a-tabs" role="tablist" hidden={uploadOnly}>
          <button type="button" role="tab" aria-selected={tab === "upload"} onClick={() => { setTab("upload"); setError(""); }}>Upload new</button>
          <button type="button" role="tab" aria-selected={tab === "library"} onClick={() => { setError(""); openLibrary(); }}>Media library</button>
        </div>

        <div className="a-modal-body">
          {tab === "upload" ? (
            <>
              <div
                className={`a-drop${dragging ? " over" : ""}${preview ? " has" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]); }}
              >
                {preview && file ? (
                  <div className="a-drop-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL) */}
                    <img src={preview} alt="Selected image preview" />
                    <div>
                      <b>{file.name}</b>
                      <span className="muted">{mb(file.size)}</span>
                      <button type="button" className="a-btn ghost sm" onClick={() => fileInput.current?.click()}>Choose a different file</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 4v12M7 9l5-5 5 5" /></svg>
                    <p><b>Drag &amp; drop an image here</b></p>
                    <p className="muted">or</p>
                    <button type="button" className="a-btn" onClick={() => fileInput.current?.click()}>Browse files</button>
                    <p className="muted small">JPG, PNG, WebP or AVIF · max 8 MB · you can also paste (Ctrl+V)</p>
                  </>
                )}
                <input ref={fileInput} type="file" accept={TYPES.join(",")} hidden onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ""; }} />
              </div>

              <details className="a-link-opt">
                <summary>Use an image link instead</summary>
                <div className="a-link-row">
                  <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" aria-label="Image link" />
                  <button type="button" className="a-btn ghost" onClick={useLink}>Use link</button>
                </div>
              </details>
            </>
          ) : (
            <>
              <input className="a-media-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search images…" aria-label="Search images" />
              {!library ? (
                <p className="muted">Loading images…</p>
              ) : shown.length === 0 ? (
                <p className="muted">No images found.</p>
              ) : (
                <div className="a-media-grid" role="listbox" aria-label="Images">
                  {shown.map((m) => (
                    <button
                      key={m.url}
                      type="button"
                      role="option"
                      aria-selected={picked === m.url}
                      className="a-media-item"
                      title={m.name}
                      onClick={() => setPicked(m.url)}
                      onDoubleClick={() => finish(m.url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                      <img src={m.url} alt="" loading="lazy" />
                      <span>{m.uploaded ? "Uploaded" : "Site"} · {m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {error && <p className="a-alert err" role="alert">{error}</p>}
        </div>

        <footer className="a-modal-foot">
          <button type="button" className="a-btn ghost" onClick={() => dialog.current?.close()}>Cancel</button>
          {tab === "upload" ? (
            <button type="button" className="a-btn" disabled={!file || pending} onClick={upload}>
              {pending ? "Uploading…" : "Upload & use image"}
            </button>
          ) : (
            <button type="button" className="a-btn" disabled={!picked} onClick={() => finish(picked)}>Use selected image</button>
          )}
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}

/** Button that opens the media picker and hands back the chosen image URL. */
export function PickImageButton({
  label,
  onSelect,
  className = "a-btn ghost sm",
  uploadOnly,
  title,
}: {
  label: string;
  onSelect: (url: string) => void;
  className?: string;
  uploadOnly?: boolean;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{label}</button>
      {open && <MediaPicker onSelect={onSelect} onClose={() => setOpen(false)} uploadOnly={uploadOnly} title={title} />}
    </>
  );
}
