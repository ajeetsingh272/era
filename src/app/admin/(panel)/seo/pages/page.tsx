import Link from "next/link";
import type { Metadata } from "next";
import { auditAllPages } from "@/server/services/seo";

export const metadata: Metadata = { title: "Page SEO" };

export default function SeoPagesPage() {
  const rows = auditAllPages();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Page SEO</h1>
          <p>Title, description, social image and indexing for every page. Pages without custom SEO use smart defaults from their content.</p>
        </div>
      </div>
      <section className="a-card">
        <div className="a-table-wrap" style={{ borderTop: 0, marginTop: -20 }}>
          <table className="a-table">
            <thead>
              <tr><th>Page</th><th>Google title &amp; description</th><th>Source</th><th>Score</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.path}>
                  <td><b>{r.label}</b><div className="muted">{r.path}</div></td>
                  <td style={{ maxWidth: 460 }}>
                    <div style={{ color: "#1a0dab" }}>{r.title}</div>
                    <div className="muted" style={{ fontSize: ".85rem" }}>{r.description}</div>
                  </td>
                  <td>{r.hasOverride ? <span className="a-badge good">Custom</span> : <span className="a-badge neutral">Auto</span>}</td>
                  <td><span className={`a-badge ${r.level}`}>{r.score}{r.issues ? ` · ${r.issues} tip${r.issues > 1 ? "s" : ""}` : ""}</span></td>
                  <td className="num"><Link className="a-btn ghost sm" href={`/admin/seo/pages/edit?path=${encodeURIComponent(r.path)}`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
