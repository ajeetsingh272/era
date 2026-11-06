import Link from "next/link";
import type { Metadata } from "next";
import { enquiriesRepo } from "@/server/repositories/enquiries";
import { productsRepo } from "@/server/repositories/products";
import { settingsRepo } from "@/server/repositories/settings";
import { auditAllPages } from "@/server/services/seo";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default function Dashboard() {
  const counts = enquiriesRepo.countByStatus();
  const products = productsRepo.list({ includeDrafts: true });
  const audit = auditAllPages();
  const avg = Math.round(audit.reduce((a, r) => a + r.score, 0) / Math.max(1, audit.length));
  const weak = audit.filter((r) => r.level !== "good").sort((a, b) => a.score - b.score).slice(0, 5);
  const recent = enquiriesRepo.recent(6);
  const seo = settingsRepo.getSeo();
  const setup = [
    { done: !/localhost|example\.com/.test(seo.siteUrl), text: "Set your real website address (Global SEO → Site URL)" },
    { done: !!seo.googleVerification, text: "Verify the site in Google Search Console" },
    { done: !!seo.gaMeasurementId || !!seo.gtmId, text: "Connect Google Analytics or Tag Manager" },
    { done: !!settingsRepo.getBusiness().email, text: "Add a business email (Business & account)" },
  ];

  return (
    <>
      <div className="a-top">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your website content, SEO health and enquiries.</p>
        </div>
      </div>

      <div className="a-grid cols-4">
        <Link className="a-card a-stat" href="/admin/enquiries?status=new"><b>{counts.new}</b><span>New enquiries</span></Link>
        <Link className="a-card a-stat" href="/admin/enquiries"><b>{counts.new + counts.read}</b><span>Open enquiries</span></Link>
        <Link className="a-card a-stat" href="/admin/products"><b>{products.filter((p) => p.published).length}</b><span>Published products ({products.length} total)</span></Link>
        <Link className="a-card a-stat" href="/admin/seo/pages"><b>{avg}<small style={{ fontSize: "1rem" }}>/100</small></b><span>Average SEO score ({audit.length} pages)</span></Link>
      </div>

      <div className="a-grid cols-2" style={{ marginTop: 18 }}>
        <section className="a-card">
          <div className="a-card-head"><h2>Recent enquiries</h2><Link href="/admin/enquiries">View all</Link></div>
          {recent.length === 0 ? (
            <p className="muted">No enquiries yet. They appear here when visitors use the contact form.</p>
          ) : (
            <div className="a-table-wrap">
              <table className="a-table">
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id} className={e.status === "new" ? "a-row-new" : undefined}>
                      <td><b>{e.name}</b><div className="muted">{e.product || "General enquiry"}</div></td>
                      <td className="num muted">{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="a-card">
          <div className="a-card-head"><h2>SEO – needs attention</h2><Link href="/admin/seo/pages">All pages</Link></div>
          {weak.length === 0 ? (
            <p className="muted">All pages score well. 🎉</p>
          ) : (
            <div className="a-table-wrap">
              <table className="a-table">
                <tbody>
                  {weak.map((r) => (
                    <tr key={r.path}>
                      <td><Link href={`/admin/seo/pages/edit?path=${encodeURIComponent(r.path)}`}>{r.label}</Link><div className="muted">{r.path}</div></td>
                      <td className="num"><span className={`a-badge ${r.level}`}>{r.score}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="a-card" style={{ marginTop: 18 }}>
        <div className="a-card-head"><h2>Launch checklist</h2></div>
        <ul className="a-issues">
          {setup.map((s) => (
            <li key={s.text} className={s.done ? "" : "warning"} style={s.done ? { color: "var(--a-good)" } : undefined}>
              {s.done ? "Done – " : ""}{s.text}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
