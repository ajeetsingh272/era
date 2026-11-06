import Link from "next/link";
import { Img } from "./Img";
import { Headline } from "./Display";

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

/**
 * Inner-page hero: breadcrumb, accent label, two-line headline, subtitle, scroll cue.
 * Lines rise in one after another; the faint background photo drifts slower than the page (parallax).
 * The matching BreadcrumbList JSON-LD is emitted per page.
 */
export function PageBanner({ title, subtitle, trail, label, image }: { title: string; subtitle: string; trail: string[]; label?: string; image?: string }) {
  return (
    <header className="ph dots">
      {image && (
        <div className="ph-bg" aria-hidden="true">
          <div className="ph-bg-in" data-speed="-0.3">
            <Img src={image} alt="" sizes="100vw" priority />
          </div>
        </div>
      )}
      <div className="wrap ph-in">
        <nav className="crumb rv" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          {trail.map((t) => <span key={t}> / {t}</span>)}
        </nav>
        <p className="lbl c rv" style={d(1)}>{label ?? trail[trail.length - 1]}</p>
        <div className="rv" style={d(2)}><Headline text={title} as="h1" /></div>
        {subtitle && <p className="sub rv" style={d(4)}>{subtitle}</p>}
        <a className="scr rv" style={d(5)} href="#content" aria-label="Scroll to content">
          <i aria-hidden="true" />
          <span>Scroll down</span>
        </a>
      </div>
    </header>
  );
}
