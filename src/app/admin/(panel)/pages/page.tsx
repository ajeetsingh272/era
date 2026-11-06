import Link from "next/link";
import type { Metadata } from "next";
import { pagesRepo } from "@/server/repositories/pages";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Pages" };

const seoLink = (path: string) => `/admin/seo/pages/edit?path=${encodeURIComponent(path)}`;

const BUILT_IN = [
  { label: "Home", path: "/", edit: "/admin/pages/home", note: "Hero, slideshow, about, tiles, why us, steps, call-to-action" },
  { label: "About Us", path: "/about", edit: "/admin/pages/about", note: "Banner, text, highlights, images" },
  { label: "Contact Us", path: "/contact", edit: "/admin/settings", note: "Uses your business details (phone, address, map)" },
];

export default function PagesPage() {
  const pages = pagesRepo.list({ includeDrafts: true });
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Pages</h1>
          <p>Edit the text and images on your main pages, or add new pages (e.g. Projects, Services, Gallery).</p>
        </div>
        <Link className="a-btn" href="/admin/pages/new">+ Add page</Link>
      </div>

      <section className="a-card">
        <div className="a-card-head"><h2>Main pages</h2></div>
        <div className="a-table-wrap">
          <table className="a-table">
            <tbody>
              {BUILT_IN.map((p) => (
                <tr key={p.path}>
                  <td><b>{p.label}</b><div className="muted">{p.note}</div></td>
                  <td><a href={p.path} target="_blank" rel="noopener">{p.path}</a></td>
                  <td className="num">
                    <div className="a-actions" style={{ justifyContent: "flex-end" }}>
                      <Link className="a-btn ghost sm" href={p.edit}>{p.path === "/contact" ? "Edit details" : "Edit content"}</Link>
                      <Link className="a-btn ghost sm" href={seoLink(p.path)}>SEO</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="a-card">
        <div className="a-card-head"><h2>Your pages</h2></div>
        {pages.length === 0 ? (
          <p className="muted">No extra pages yet. Use <b>+ Add page</b> to create one – it gets its own address, SEO and (optionally) a menu link.</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr><th>Page</th><th>URL</th><th>Status</th><th>In menu</th><th>Updated</th><th></th></tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.title}</b><div className="muted">{p.sections.length} section{p.sections.length === 1 ? "" : "s"}</div></td>
                    <td><a href={`/${p.slug}`} target="_blank" rel="noopener">/{p.slug}</a></td>
                    <td>{p.published ? <span className="a-badge good">Published</span> : <span className="a-badge neutral">Draft</span>}</td>
                    <td>{p.showInMenu ? "Yes" : "No"}</td>
                    <td className="muted">{formatDate(p.updatedAt)}</td>
                    <td className="num">
                      <div className="a-actions" style={{ justifyContent: "flex-end" }}>
                        <Link className="a-btn ghost sm" href={`/admin/pages/${p.id}`}>Edit</Link>
                        <Link className="a-btn ghost sm" href={seoLink(`/${p.slug}`)}>SEO</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
