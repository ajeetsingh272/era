"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  { title: "Overview", links: [{ href: "/admin", label: "Dashboard", exact: true }] },
  {
    title: "Content",
    links: [
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/media", label: "Media library" },
      { href: "/admin/enquiries", label: "Enquiries", badge: "enquiries" as const },
    ],
  },
  {
    title: "SEO",
    links: [
      { href: "/admin/seo/pages", label: "Page SEO" },
      { href: "/admin/seo", label: "Global SEO", exact: true },
    ],
  },
  { title: "Setup", links: [{ href: "/admin/settings", label: "Business & account" }] },
];

export function AdminNav({ newEnquiries }: { newEnquiries: number }) {
  const path = usePathname();
  return (
    <>
      {GROUPS.map((g) => (
        <div key={g.title} style={{ display: "contents" }}>
          <div className="a-nav-group">{g.title}</div>
          {g.links.map((l) => {
            const active = "exact" in l && l.exact ? path === l.href : path === l.href || path.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href} className="a-link" aria-current={active ? "page" : undefined}>
                {l.label}
                {"badge" in l && newEnquiries > 0 && <span className="a-count">{newEnquiries}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
