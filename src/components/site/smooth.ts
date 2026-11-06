"use client";

import type Lenis from "lenis";

/** Shared handle to the smooth-scroll instance (null when disabled: touch, reduced motion, before mount). */
export const smooth: { lenis: Lenis | null } = { lenis: null };

/** Freeze/unfreeze page scrolling (e.g. while the full-screen menu is open). */
export function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle("locked", locked);
  if (locked) smooth.lenis?.stop();
  else smooth.lenis?.start();
}
