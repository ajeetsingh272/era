import Link from "next/link";
import type { Metadata } from "next";
import { HomeContentForm } from "@/components/admin/PageForms";
import { saveHomeContent } from "@/server/actions/admin";
import { settingsRepo } from "@/server/repositories/settings";

export const metadata: Metadata = { title: "Edit Home page" };

export default function EditHomePage() {
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/pages">← Pages</Link>
          <h1>Home page</h1>
          <p>
            Live at <a href="/" target="_blank" rel="noopener">/ ↗</a> ·{" "}
            <Link href="/admin/seo/pages/edit?path=%2F">Edit SEO for this page</Link>
          </p>
        </div>
      </div>
      <HomeContentForm content={settingsRepo.getHome()} action={saveHomeContent} />
    </>
  );
}
