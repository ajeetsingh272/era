import "server-only";
import { getDb } from "../db";
import type { Enquiry, EnquiryStatus } from "@/types";

interface Row {
  id: number;
  name: string;
  contact: string;
  product: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

const toEnquiry = (r: Row): Enquiry => ({
  id: r.id,
  name: r.name,
  contact: r.contact,
  product: r.product,
  message: r.message,
  status: r.status,
  createdAt: r.created_at,
});

export const enquiriesRepo = {
  create(e: { name: string; contact: string; product: string; message: string; ip: string }): number {
    const res = getDb()
      .prepare("INSERT INTO enquiries (name, contact, product, message, ip) VALUES (?, ?, ?, ?, ?)")
      .run(e.name, e.contact, e.product, e.message, e.ip);
    return Number(res.lastInsertRowid);
  },

  list(status?: EnquiryStatus): Enquiry[] {
    const db = getDb();
    const rows = status
      ? db.prepare("SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC, id DESC").all(status)
      : db.prepare("SELECT * FROM enquiries WHERE status != 'archived' ORDER BY created_at DESC, id DESC").all();
    return (rows as unknown as Row[]).map(toEnquiry);
  },

  listAll(): Enquiry[] {
    return (getDb().prepare("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC").all() as unknown as Row[]).map(toEnquiry);
  },

  recent(limit = 5): Enquiry[] {
    return (getDb().prepare("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC LIMIT ?").all(limit) as unknown as Row[]).map(toEnquiry);
  },

  countByStatus(): Record<EnquiryStatus, number> {
    const out: Record<EnquiryStatus, number> = { new: 0, read: 0, archived: 0 };
    for (const r of getDb().prepare("SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status").all() as { status: EnquiryStatus; n: number }[]) {
      out[r.status] = r.n;
    }
    return out;
  },

  setStatus(id: number, status: EnquiryStatus) {
    getDb().prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
  },

  delete(id: number) {
    getDb().prepare("DELETE FROM enquiries WHERE id = ?").run(id);
  },
};
