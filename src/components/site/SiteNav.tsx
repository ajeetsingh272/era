"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Img } from "./Img";
import { lockScroll } from "./smooth";

interface NavProduct { slug: string; name: string; heroImage: string }
interface NavPage { slug: string; title: string }
interface NavContact { phone: string; tel: string; email: string; address: string; instagram: string; whatsapp: string }

/** Minimal header (logo + MENU button) with a full-screen overlay menu. */
export function SiteNav({ products, logo, pages = [], contact }: { products: NavProduct[]; logo: string; pages?: NavPage[]; contact?: NavContact }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the menu whenever the route changes (state reset during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  // Header gets a backdrop once scrolled, slides away while scrolling down and returns on scroll up.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400);
        last = y;
      }
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const current = (href: string) => (pathname === href ? "page" : undefined);
  const main = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    ...pages.map((p) => ({ href: `/${p.slug}`, label: p.title })),
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header id="nv" className={`hd${scrolled ? " s" : ""}${open ? " open" : ""}${hidden && !open ? " up" : ""}`}>
        <Link className="logo" href="/" aria-label="ERA Interior Products – home">
          <Img src={logo} alt="ERA Interior Products" sizes="140px" priority className="logo-d" />
          <Img src="/images/logo-light.png" alt="" sizes="140px" className="logo-l" />
        </Link>
        <button className="menu-btn" data-magnet aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
          <span>{open ? "Close" : "Menu"}</span>
          <i aria-hidden="true"><b /><b /><b /></i>
        </button>
      </header>

      <div id="menu" className={`ov${open ? " open" : ""}`} inert={!open} aria-label="Main menu">
        <div className="ov-in">
          <nav className="ov-main" aria-label="Main">
            <p className="lbl">Menu</p>
            <ul>
              {main.map((l, i) => (
                <li key={l.href} style={{ "--d": i } as React.CSSProperties}>
                  <Link href={l.href} aria-current={current(l.href)}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ov-side">
            <p className="lbl">Products</p>
            <ul className="ov-prod">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/products/${p.slug}`} aria-current={current(`/products/${p.slug}`)}>{p.name}</Link>
                </li>
              ))}
            </ul>
            {contact && (
              <div className="ov-contact">
                <p className="lbl">Get in touch</p>
                {contact.tel && <a href={`tel:${contact.tel}`}>{contact.phone}</a>}
                {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                {contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener">WhatsApp</a>}
                {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener">Instagram</a>}
                {contact.address && <span>{contact.address}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
