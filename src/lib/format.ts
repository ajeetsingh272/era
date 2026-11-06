/** SQLite stores UTC as "YYYY-MM-DD HH:MM:SS"; show it in Indian time. */
export function formatDate(sqlUtc: string): string {
  const d = new Date(sqlUtc.includes("T") ? sqlUtc : sqlUtc.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return sqlUtc;
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Quote a value for CSV (RFC 4180) and neutralise spreadsheet formula injection. */
export function csvCell(v: string | number): string {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
