import Link from "next/link";
import type { Metadata } from "next";
import { AboutContentForm } from "@/components/admin/PageForms";
import { saveAboutContent } from "@/server/actions/admin";
import { settingsRepo } from "@/server/repositories/settings";

export const metadata: Metadata = { title: "Edit About page" };

export default function EditAboutPage() {
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/pages">← Pages</Link>
          <h1>About Us page</h1>
          <p>
            Live at <a href="/about" target="_blank" rel="noopener">/about ↗</a> ·{" "}
            <Link href="/admin/seo/pages/edit?path=%2Fabout">Edit SEO for this page</Link>
          </p>
        </div>
      </div>
      <AboutContentForm content={settingsRepo.getAbout()} action={saveAboutContent} />
    </>
  );
}
