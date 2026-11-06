import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteProduct, saveProduct } from "@/server/actions/admin";
import { productsRepo } from "@/server/repositories/products";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = productsRepo.getById(Number((await params).id));
  return { title: p ? `Edit ${p.name}` : "Product" };
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const { created } = await searchParams;
  const p = Number.isInteger(id) ? productsRepo.getById(id) : null;
  if (!p) notFound();

  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/products">← Products</Link>
          <h1>{p.name}</h1>
          <p>
            Live at <a href={`/products/${p.slug}`} target="_blank" rel="noopener">/products/{p.slug} ↗</a> ·{" "}
            <Link href={`/admin/seo/pages/edit?path=${encodeURIComponent(`/products/${p.slug}`)}`}>Edit SEO for this page</Link>
          </p>
        </div>
        <form action={deleteProduct.bind(null, p.id)}>
          <ConfirmButton message={`Delete "${p.name}"? Its page will stop working. This cannot be undone.`}>Delete product</ConfirmButton>
        </form>
      </div>
      {created && <p className="a-alert ok" style={{ marginBottom: 16 }}>Product created.</p>}
      <ProductForm product={p} action={saveProduct.bind(null, p.id)} />
    </>
  );
}
