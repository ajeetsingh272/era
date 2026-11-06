"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Count-up animation for [data-n] numbers. */
function countUp(el: HTMLElement) {
  const n = Number(el.dataset.n);
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / 1300);
    el.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Scroll-reveal (.rv / .cr) and number counters.
 * Content is fully visible without JS – the `js` class on <html> enables the hidden start state.
 */
export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A hidden .cr is fully clipped by its own clip-path, which IntersectionObserver treats as
    // "never visible" – so we watch its parent and reveal the .cr elements inside it.
    const targets = new Map<Element, HTMLElement[]>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          for (const el of targets.get(e.target) ?? []) {
            el.classList.add("in");
            if (el.dataset.n) countUp(el);
          }
          io.unobserve(e.target);
        }),
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );

    const raf = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("main .rv:not(.in), main .cr:not(.in), main [data-n]").forEach((el) => {
        if (el.dataset.n && !reduce) el.textContent = "0";
        const watch = el.classList.contains("cr") && el.parentElement ? el.parentElement : el;
        targets.set(watch, [...(targets.get(watch) ?? []), el]);
        io.observe(watch);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
