import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { resetPageSeo, savePageSeo } from "@/server/actions/admin";
import { fallbackFor, seoTargets } from "@/server/services/seo";
import { seoPagesRepo } from "@/server/repositories/seo-pages";
import { settingsRepo } from "@/server/repositories/settings";

export const metadata: Metadata = { title: "Edit page SEO" };

type Props = { searchParams: Promise<{ path?: string; reset?: string }> };

export default async function EditPageSeo({ searchParams }: Props) {
  const { path = "", reset } = await searchParams;
  const target = seoTargets().find((t) => t.path === path);
  if (!target) notFound();

  const override = seoPagesRepo.get(path);
  const settings = settingsRepo.getSeo();

  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/seo/pages">← Page SEO</Link>
          <h1>{target.label}</h1>
          <p><a href={path} target="_blank" rel="noopener">{path} ↗</a></p>
        </div>
        {override && (
          <form action={resetPageSeo.bind(null, path)}>
            <ConfirmButton className="a-btn ghost" message="Remove custom SEO and go back to automatic values?">Reset to automatic</ConfirmButton>
          </form>
        )}
      </div>
      {reset && <p className="a-alert ok" style={{ marginBottom: 16 }}>Custom SEO removed – this page now uses automatic values.</p>}
      <PageSeoForm path={path} override={override} settings={settings} fallback={fallbackFor(path)} action={savePageSeo} />
    </>
  );
}
