"use client";

import { useEffect, useState } from "react";

/**
 * Floating quick-contact: WhatsApp (pre-filled with the page the visitor is looking at) + call on phones.
 * Hidden while the full-screen menu is open (see .locked in site.css).
 */
export function QuickContact({ whatsapp, tel, phone }: { whatsapp: string; tel: string; phone: string }) {
  // Appears once the visitor starts scrolling, so it never covers the hero controls.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  if (!whatsapp && !tel) return null;

  // Built at click time so it always names the current page/product.
  const waHref = () => {
    const topic = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim();
    const onProduct = location.pathname.startsWith("/products/");
    const text = onProduct && topic ? `Hi ERA Interior, I'm interested in ${topic}. ` : "Hi ERA Interior, I'd like to know more about your products. ";
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`qc${shown ? " shown" : ""}`} aria-label="Quick contact">
      {tel && (
        <a className="qc-btn qc-call" href={`tel:${tel}`} aria-label={`Call ${phone}`} data-magnet>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" /></svg>
        </a>
      )}
      {whatsapp && (
        <a
          className="qc-btn qc-wa"
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener"
          aria-label="Chat with us on WhatsApp"
          data-magnet
          onClick={(e) => (e.currentTarget.href = waHref())}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5.1 5.1 0 0 0 1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z" /></svg>
          <span>Chat with us</span>
        </a>
      )}
    </div>
  );
}
