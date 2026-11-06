import Link from "next/link";
import type { Metadata } from "next";
import { PageForm } from "@/components/admin/PageForms";
import { savePage } from "@/server/actions/admin";

export const metadata: Metadata = { title: "New page" };

export default function NewPagePage() {
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/pages">← Pages</Link>
          <h1>New page</h1>
        </div>
      </div>
      <PageForm page={null} action={savePage.bind(null, null)} />
    </>
  );
}
