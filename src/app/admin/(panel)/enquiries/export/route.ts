import { getCurrentAdmin } from "@/server/services/auth";
import { enquiriesRepo } from "@/server/repositories/enquiries";
import { csvCell, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getCurrentAdmin())) return new Response("Unauthorized", { status: 401 });

  const header = ["ID", "Received", "Name", "Contact", "Product", "Message", "Status"];
  const rows = enquiriesRepo.listAll().map((e) => [e.id, formatDate(e.createdAt), e.name, e.contact, e.product, e.message, e.status]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="era-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
