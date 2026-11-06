import Link from "next/link";
import { requireAdmin } from "@/server/services/auth";
import { enquiriesRepo } from "@/server/repositories/enquiries";
import { logout } from "@/server/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";

// Admin pages always read fresh data and require a valid session.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const newCount = enquiriesRepo.countByStatus().new;

  return (
    <div className="a-shell">
      <aside className="a-side">
        <Link href="/admin" className="a-brand">
          <span>ERA Admin<small>Website control panel</small></span>
        </Link>
        <AdminNav newEnquiries={newCount} />
        <div className="a-side-foot">
          <div>{admin.email}</div>
          <a href="/" target="_blank" rel="noopener" style={{ color: "#fff" }}>View website ↗</a>
          <form action={logout}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="a-main">{children}</main>
    </div>
  );
}
