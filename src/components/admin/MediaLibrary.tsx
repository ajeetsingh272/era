"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMedia } from "@/server/actions/admin";
import { PickImageButton } from "./MediaPicker";
import type { MediaItem } from "@/types";

export type LibraryItem = MediaItem & { usedIn: string[] };
type Filter = "all" | "uploaded" | "site" | "unused";

const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const date = (ms: number) => new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Admin media library: browse, search, upload, inspect usage, copy URL, delete unused uploads. */
export function MediaLibrary({ items }: { items: LibraryItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");
  const [dims, setDims] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const counts = {
    all: items.length,
    uploaded: items.filter((i) => i.uploaded).length,
    site: items.filter((i) => !i.uploaded).length,
    unused: items.filter((i) => i.usedIn.length === 0).length,
  };
  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (i) =>
      (filter === "all" || (filter === "uploaded" ? i.uploaded : filter === "site" ? !i.uploaded : i.usedIn.length === 0)) &&
      (!q || i.name.toLowerCase().includes(q)),
  );
  const selected = items.find((i) => i.url === selectedUrl) ?? null;

  const select = (url: string) => {
    setSelectedUrl(url);
    setDims("");
    setMessage(null);
  };

  const onUploaded = (url: string) => {
    setFilter("all");
    setQuery("");
    select(url);
    setMessage({ ok: true, text: "Image uploaded. Use it from any image field’s “Choose image” popup." });
    router.refresh();
  };

  const copy = async (url: string) => {
    const full = new URL(url, location.origin).href;
    try {
      await navigator.clipboard.writeText(full);
      setMessage({ ok: true, text: "Link copied." });
    } catch {
      setMessage({ ok: false, text: full });
    }
  };

  const remove = (item: LibraryItem) => {
    if (!confirm(`Delete “${item.name}” permanently? This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteMedia(item.url);
      if (res.ok) {
        setSelectedUrl("");
        setMessage({ ok: true, text: `“${item.name}” deleted.` });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "Could not delete this image." });
      }
    });
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "uploaded", label: "Uploaded" },
    { key: "site", label: "Built-in" },
    { key: "unused", label: "Not used" },
  ];

  return (
    <>
      <div className="a-top">
        <div>
          <h1>Media library</h1>
          <p>All images on your website. Upload new ones here or straight from any image field.</p>
        </div>
        <PickImageButton label="+ Upload image" className="a-btn" uploadOnly title="Upload an image" onSelect={onUploaded} />
      </div>

      <div className="a-media-tools">
        <div className="a-tabs" role="tablist" aria-label="Filter images">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label} <span className="a-tab-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <input className="a-media-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by file name…" aria-label="Search images" />
      </div>

      {message && <p className={`a-alert ${message.ok ? "ok" : "err"}`} role={message.ok ? "status" : "alert"} style={{ marginBottom: 14 }}>{message.text}</p>}

      <div className={`a-media-layout${selected ? " with-panel" : ""}`}>
        <section className="a-card">
          {shown.length === 0 ? (
            <p className="muted">No images match.</p>
          ) : (
            <div className="a-media-grid lib" role="listbox" aria-label="Images">
              {shown.map((m) => (
                <button key={m.url} type="button" role="option" aria-selected={m.url === selectedUrl} className="a-media-item" title={m.name} onClick={() => select(m.url)}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                  <img src={m.url} alt="" loading="lazy" />
                  <span>
                    {m.usedIn.length ? <i className="a-dot used" title="In use" /> : <i className="a-dot" title="Not used" />}
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {selected && (
          <aside className="a-card a-media-panel" aria-label="Image details">
            <div className="a-card-head">
              <h2>Details</h2>
              <button type="button" className="a-modal-x" aria-label="Close details" onClick={() => setSelectedUrl("")}>×</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
            <img className="a-media-big" src={selected.url} alt="" onLoad={(e) => setDims(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight} px`)} />
            <dl className="a-media-meta">
              <dt>File</dt><dd>{selected.name}</dd>
              <dt>Size</dt><dd>{kb(selected.size)}{dims && ` · ${dims}`}</dd>
              <dt>Type</dt><dd>{selected.uploaded ? `Uploaded ${date(selected.modified)}` : "Built-in site image"}</dd>
              <dt>Used in</dt>
              <dd>
                {selected.usedIn.length ? (
                  <ul>{selected.usedIn.map((u) => <li key={u}>{u}</li>)}</ul>
                ) : (
                  <span className="muted">Not used anywhere</span>
                )}
              </dd>
            </dl>
            <div className="a-media-url">
              <input readOnly value={selected.url} aria-label="Image address" onFocus={(e) => e.currentTarget.select()} />
              <button type="button" className="a-btn ghost sm" onClick={() => copy(selected.url)}>Copy link</button>
            </div>
            <div className="a-actions">
              <a className="a-btn ghost sm" href={selected.url} target="_blank" rel="noopener">Open full size ↗</a>
              {selected.uploaded && (
                <button
                  type="button"
                  className="a-btn danger sm"
                  disabled={pending || selected.usedIn.length > 0}
                  title={selected.usedIn.length ? "Replace it where it is used before deleting" : undefined}
                  onClick={() => remove(selected)}
                >
                  {pending ? "Deleting…" : "Delete image"}
                </button>
              )}
            </div>
            {selected.uploaded && selected.usedIn.length > 0 && <p className="hint">In use, so it can’t be deleted. Replace it in the places above first.</p>}
          </aside>
        )}
      </div>
    </>
  );
}
