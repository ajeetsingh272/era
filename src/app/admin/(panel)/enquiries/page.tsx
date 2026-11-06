import Link from "next/link";
import type { Metadata } from "next";
import { enquiriesRepo } from "@/server/repositories/enquiries";
import { deleteEnquiry, setEnquiryStatus } from "@/server/actions/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { formatDate } from "@/lib/format";
import type { EnquiryStatus } from "@/types";

export const metadata: Metadata = { title: "Enquiries" };

const TABS: { key: EnquiryStatus | "open"; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
];

const contactHref = (c: string) => (c.includes("@") ? `mailto:${c}` : `tel:${c.replace(/[^\d+]/g, "")}`);

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "open" } = await searchParams;
  const tab = TABS.find((t) => t.key === status)?.key ?? "open";
  const list = enquiriesRepo.list(tab === "open" ? undefined : tab);
  const counts = enquiriesRepo.countByStatus();

  return (
    <>
      <div className="a-top">
        <div>
          <h1>Enquiries</h1>
          <p>Messages sent through the website contact form.</p>
        </div>
        <a className="a-btn ghost" href="/admin/enquiries/export" download>Download CSV</a>
      </div>

      <nav className="a-tabs" aria-label="Filter">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/enquiries?status=${t.key}`} aria-current={t.key === tab ? "page" : undefined}>
            {t.label} ({t.key === "open" ? counts.new + counts.read : counts[t.key]})
          </Link>
        ))}
      </nav>

      <section className="a-card">
        {list.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Nothing here.</p>
        ) : (
          <div className="a-table-wrap" style={{ borderTop: 0, margin: "-20px" }}>
            <table className="a-table">
              <thead>
                <tr><th>From</th><th>Product</th><th>Message</th><th>Received</th><th></th></tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id} className={e.status === "new" ? "a-row-new" : undefined}>
                    <td>
                      <b>{e.name}</b>
                      <div><a href={contactHref(e.contact)}>{e.contact}</a></div>
                      {e.status === "new" && <span className="a-badge ok">New</span>}
                    </td>
                    <td>{e.product || <span className="muted">—</span>}</td>
                    <td><div className="a-msg">{e.message || <span className="muted">(no message)</span>}</div></td>
                    <td className="muted" style={{ whiteSpace: "nowrap" }}>{formatDate(e.createdAt)}</td>
                    <td className="num">
                      <div className="a-actions" style={{ justifyContent: "flex-end" }}>
                        {e.status === "new" && (
                          <form action={setEnquiryStatus.bind(null, e.id, "read")}><button className="a-btn ghost sm">Mark read</button></form>
                        )}
                        {e.status !== "archived" ? (
                          <form action={setEnquiryStatus.bind(null, e.id, "archived")}><button className="a-btn ghost sm">Archive</button></form>
                        ) : (
                          <form action={setEnquiryStatus.bind(null, e.id, "read")}><button className="a-btn ghost sm">Restore</button></form>
                        )}
                        <form action={deleteEnquiry.bind(null, e.id)}>
                          <ConfirmButton message={`Delete the enquiry from ${e.name}?`}>Delete</ConfirmButton>
                        </form>
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
