"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Img } from "./Img";
import { splitTitle } from "@/lib/text-lists";
import type { LinkCard as HeroSlide } from "@/types";

const INTERVAL = 8000;

type State = { cur: number; prev: number | null; dir: 1 | -1 };

/**
 * Full-screen split slider: copy on the left (dot grid), photo on the right.
 * Each change slides the whole slide sideways while the photo (drift + zoom) and the
 * headline (drift + fade + scale) move at their own pace – a parallax slide transition.
 * The gold bar fills over INTERVAL and advances; hover/focus pauses it; reduced motion disables autoplay.
 */
export function HeroSlider({ slides, label, primaryHref }: { slides: HeroSlide[]; label: string; primaryHref: string }) {
  const [s, setS] = useState<State>({ cur: 0, prev: null, dir: 1 });
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(false);
  const touchX = useRef(0);
  const n = slides.length;

  useEffect(() => setAuto(n > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches), [n]); // eslint-disable-line react-hooks/set-state-in-effect -- client-only media query

  const go = useCallback(
    (to: number, dir: 1 | -1) => setS((p) => ({ cur: (to + n) % n, prev: p.cur, dir })),
    [n],
  );

  const state = (i: number) => (i === s.cur ? "on" : i === s.prev ? "out" : "idle");

  return (
    <section
      className={`hx${s.prev === null ? " first" : ""}`}
      data-dir={s.dir > 0 ? "next" : "prev"}
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(s.cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }}
    >
      <div className="hx-track">
        {slides.map((sl, i) => {
          const [solid, outline] = splitTitle(sl.title);
          const Title = i === 0 ? "h1" : "h2"; // one h1 per page: the headline slide
          const st = state(i);
          return (
            <div key={i} className={`hx-s ${st}`} aria-hidden={st !== "on"} inert={st !== "on"} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
              <div className="hx-l dots">
                <div className="hx-t">
                  <p className="lbl">{label}</p>
                  <Title className={`ttl hx-title${sl.title.length > 26 ? " long" : ""}`}>
                    <span className="sol">{solid}</span> <span className="ol">{outline}</span>
                  </Title>
                  <p className="hx-p">{sl.text}</p>
                  <div className="hx-b">
                    <Link className="btn" href={sl.href || primaryHref}>Explore</Link>
                    <Link className="lnk" href="/contact">Get a quote</Link>
                  </div>
                </div>
              </div>
              <div className="hx-r">
                <div className="hx-img">
                  <Img src={sl.image} alt={sl.title} sizes="(max-width: 900px) 100vw, 60vw" priority={i === 0} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hx-bar" aria-hidden="true">
        {auto ? (
          <i
            key={s.cur}
            className={`run${paused ? " paused" : ""}`}
            style={{ animationDuration: `${INTERVAL}ms` }}
            onAnimationEnd={() => go(s.cur + 1, 1)}
          />
        ) : (
          <i style={{ width: `${((s.cur + 1) / n) * 100}%` }} />
        )}
      </div>

      {n > 1 && (
        <div className="hx-nav">
          <span className="lbl-s">
            <b>{String(s.cur + 1).padStart(2, "0")}</b> / {String(n).padStart(2, "0")}
          </span>
          <button type="button" data-magnet aria-label="Previous slide" onClick={() => go(s.cur - 1, -1)}>←</button>
          <button type="button" data-magnet aria-label="Next slide" onClick={() => go(s.cur + 1, 1)}>→</button>
        </div>
      )}
    </section>
  );
}
