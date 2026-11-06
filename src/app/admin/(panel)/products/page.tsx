import Link from "next/link";
import type { Metadata } from "next";
import { productsRepo } from "@/server/repositories/products";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  const products = productsRepo.list({ includeDrafts: true });
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Products</h1>
          <p>Each product gets its own page at <code>/products/&lt;slug&gt;</code>, listed in the menu, footer and sitemap.</p>
        </div>
        <Link className="a-btn" href="/admin/products/new">+ Add product</Link>
      </div>
      <section className="a-card">
        <div className="a-table-wrap" style={{ borderTop: 0, marginTop: -20 }}>
          <table className="a-table">
            <thead>
              <tr><th></th><th>Product</th><th>URL</th><th>Status</th><th>Order</th><th>Updated</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail, any URL */}
                    <img className="a-thumb" src={p.heroImage} alt="" />
                  </td>
                  <td><b>{p.name}</b><div className="muted">{p.tagline}</div></td>
                  <td><a href={`/products/${p.slug}`} target="_blank" rel="noopener">/products/{p.slug}</a></td>
                  <td>{p.published ? <span className="a-badge good">Published</span> : <span className="a-badge neutral">Draft</span>}</td>
                  <td>{p.sortOrder}</td>
                  <td className="muted">{formatDate(p.updatedAt)}</td>
                  <td className="num">
                    <div className="a-actions" style={{ justifyContent: "flex-end" }}>
                      <Link className="a-btn ghost sm" href={`/admin/products/${p.id}`}>Edit</Link>
                      <Link className="a-btn ghost sm" href={`/admin/seo/pages/edit?path=${encodeURIComponent(`/products/${p.slug}`)}`}>SEO</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
