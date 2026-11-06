import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageForm } from "@/components/admin/PageForms";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deletePage, savePage } from "@/server/actions/admin";
import { pagesRepo } from "@/server/repositories/pages";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = pagesRepo.getById(Number((await params).id));
  return { title: p ? `Edit ${p.title}` : "Page" };
}

export default async function EditPagePage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const { created } = await searchParams;
  const p = Number.isInteger(id) ? pagesRepo.getById(id) : null;
  if (!p) notFound();

  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/pages">← Pages</Link>
          <h1>{p.title}</h1>
          <p>
            Live at <a href={`/${p.slug}`} target="_blank" rel="noopener">/{p.slug} ↗</a> ·{" "}
            <Link href={`/admin/seo/pages/edit?path=${encodeURIComponent(`/${p.slug}`)}`}>Edit SEO for this page</Link>
          </p>
        </div>
        <form action={deletePage.bind(null, p.id)}>
          <ConfirmButton message={`Delete "${p.title}"? Its address will stop working. This cannot be undone.`}>Delete page</ConfirmButton>
        </form>
      </div>
      {created && <p className="a-alert ok" style={{ marginBottom: 16 }}>Page created.</p>}
      <PageForm page={p} action={savePage.bind(null, p.id)} />
    </>
  );
}
