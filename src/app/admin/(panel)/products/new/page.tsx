import Link from "next/link";
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { saveProduct } from "@/server/actions/admin";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/products">← Products</Link>
          <h1>New product</h1>
        </div>
      </div>
      <ProductForm product={null} action={saveProduct.bind(null, null)} />
    </>
  );
}
