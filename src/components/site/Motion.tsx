"use client";

import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { smooth } from "./smooth";

const LEAVE_MS = 450;
const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Site motion layer:
 *  – preloader dismissal (first load only)
 *  – smooth inertial scrolling (Lenis, native scroll underneath – SEO/a11y safe)
 *  – scroll progress bar + scroll parallax ([data-speed])
 *  – trailing cursor ring that reacts to links and wraps round buttons ([data-magnet])
 *  – fade-out / fade-in page transitions between internal pages
 * Everything degrades to plain browser behaviour on touch devices and with reduced motion.
 */
export function Motion() {
  const router = useRouter();
  const pathname = usePathname();
  const ring = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const firstPath = useRef(true);

  /* ---------- preloader ---------- */
  useEffect(() => {
    const pl = document.getElementById("pl");
    if (!pl) return;
    if (document.documentElement.classList.contains("no-pl")) {
      // Already seen this visit: skip straight to the entrance animations.
      pl.remove();
      requestAnimationFrame(() => document.documentElement.classList.add("loaded"));
      return;
    }
    const started = performance.now();
    let gone = false;
    const hide = () => {
      if (gone) return;
      gone = true;
      const wait = Math.max(0, 700 - (performance.now() - started)); // let the bar finish briefly
      setTimeout(() => {
        pl.classList.add("done");
        document.documentElement.classList.add("loaded");
        setTimeout(() => pl.remove(), 1100);
      }, wait);
    };
    if (reduced()) return void pl.remove();
    // Ready when fonts are in and the page has loaded – capped so slow images never block the visitor.
    Promise.all([document.fonts?.ready, new Promise((r) => (document.readyState === "complete" ? r(0) : addEventListener("load", r, { once: true })))]).then(hide);
    const cap = setTimeout(hide, 2200);
    return () => clearTimeout(cap);
  }, []);

  /* ---------- smooth scroll, progress bar, parallax ---------- */
  useEffect(() => {
    const parallax = () => {
      const vh = innerHeight;
      document.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
        const r = el.parentElement!.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const shift = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.speed);
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      });
    };
    const progress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      const thumb = bar.current;
      if (!thumb) return;
      const h = Math.max(40, (innerHeight / document.documentElement.scrollHeight) * innerHeight);
      thumb.style.height = `${h}px`;
      thumb.style.transform = `translate3d(0, ${(p * (innerHeight - h)).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      progress();
      if (!reduced()) parallax();
    };

    if (fine() && !reduced()) {
      const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, autoRaf: true, anchors: true, prevent: (n) => !!n.closest(".ov, dialog") });
      smooth.lenis = lenis;
      document.documentElement.classList.add("smooth");
      lenis.on("scroll", onScroll);
    } else {
      addEventListener("scroll", onScroll, { passive: true });
    }
    addEventListener("resize", onScroll);
    onScroll();
    return () => {
      smooth.lenis?.destroy();
      smooth.lenis = null;
      document.documentElement.classList.remove("smooth");
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  /* ---------- cursor ring ---------- */
  useEffect(() => {
    const el = ring.current;
    if (!el || !fine() || reduced()) return;
    document.documentElement.classList.add("has-ring");
    const pos = { x: -100, y: -100 }, target = { x: -100, y: -100 };
    let size = 40, targetSize = 40, raf = 0, magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        target.x = r.left + r.width / 2;
        target.y = r.top + r.height / 2;
      }
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element;
      magnet = t.closest<HTMLElement>("[data-magnet]");
      const hot = t.closest("a, button, summary, label, select, [role=button]");
      el.classList.toggle("hot", !!hot);
      el.classList.toggle("hide", !!t.closest("a.card, a.zoom")); // those show their own "View"/"+" badge
      el.classList.toggle("on-img", !hot && !!t.closest(".card-img, .gal, .split-media"));
      targetSize = magnet ? Math.max(magnet.offsetWidth, magnet.offsetHeight) + 10 : hot ? 56 : 40;
    };
    const onLeave = () => el.classList.add("away");
    const onEnter = () => el.classList.remove("away");
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      size += (targetSize - size) * 0.2;
      el.style.transform = `translate3d(${(pos.x - size / 2).toFixed(1)}px, ${(pos.y - size / 2).toFixed(1)}px, 0)`;
      el.style.width = el.style.height = `${size.toFixed(1)}px`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-ring");
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  /* ---------- page transitions (leave) ---------- */
  useEffect(() => {
    if (reduced()) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.hasAttribute("data-zoom")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /^\/(admin|uploads|api|images|_next)\b/.test(url.pathname) || /\.\w{2,5}$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / #anchor
      e.preventDefault(); // stops next/link; we navigate after the fade-out
      document.documentElement.classList.add("leaving");
      setTimeout(() => router.push(url.pathname + url.search + url.hash), LEAVE_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  /* ---------- page transitions (enter) ---------- */
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const html = document.documentElement;
    smooth.lenis?.scrollTo(0, { immediate: true, force: true });
    html.classList.remove("leaving");
    html.classList.add("entering");
    const t = setTimeout(() => html.classList.remove("entering"), 40);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <div ref={ring} className="ring" aria-hidden="true" />
      <div className="sbar" aria-hidden="true"><i ref={bar} /></div>
    </>
  );
}
