"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { smooth } from "./smooth";

type Item = { src: string; caption: string };

/** Optimised large version of an image through Next's image endpoint. */
const big = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`; // q must be an allowed quality (default 75)

/**
 * Site-wide photo lightbox. Any `<a data-zoom href="/img.jpg" data-caption="…">` opens it; the group is the
 * closest [data-zoom-group]. Without JS the link simply opens the image. Keyboard: ←/→, Esc; swipe on touch.
 */
export function Lightbox() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [i, setI] = useState(0);
  const touchX = useRef(0);

  const go = useCallback((n: number) => setI((c) => (items.length ? (c + n + items.length) % items.length : 0)), [items.length]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.<HTMLAnchorElement>("a[data-zoom]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const group = a.closest("[data-zoom-group]") ?? a.parentElement!;
      const links = [...group.querySelectorAll<HTMLAnchorElement>("a[data-zoom]")];
      setItems(links.map((l) => ({ src: l.getAttribute("href")!, caption: l.dataset.caption ?? "" })));
      setI(links.indexOf(a));
      dialog.current?.showModal();
      smooth.lenis?.stop();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const item = items[i];

  return (
    <dialog
      ref={dialog}
      className="lb"
      aria-label="Photo viewer"
      onClose={() => smooth.lenis?.start()}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      {item && (
        <figure className="lb-fig">
          {/* eslint-disable-next-line @next/next/no-img-element -- already optimised via /_next/image */}
          <img key={item.src} src={big(item.src)} alt={item.caption} />
          <figcaption>
            <span>{item.caption}</span>
            <span className="lbl-s"><b>{String(i + 1).padStart(2, "0")}</b> / {String(items.length).padStart(2, "0")}</span>
          </figcaption>
        </figure>
      )}
      <button type="button" className="lb-x" aria-label="Close" onClick={() => dialog.current?.close()}>×</button>
      {items.length > 1 && (
        <>
          <button type="button" className="lb-nav prev" aria-label="Previous photo" data-magnet onClick={() => go(-1)}>←</button>
          <button type="button" className="lb-nav next" aria-label="Next photo" data-magnet onClick={() => go(1)}>→</button>
        </>
      )}
    </dialog>
  );
}
