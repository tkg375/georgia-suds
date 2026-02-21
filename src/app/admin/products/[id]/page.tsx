import { notFound } from "next/navigation";
import { firestore } from "@/lib/firebase-admin";
import type { Product, Category } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

export const runtime = "edge";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [productDoc, categoryDocs] = await Promise.all([
    firestore.getDoc("products", id),
    firestore.listDocs("categories"),
  ]);

  if (!productDoc.exists) notFound();

  const product = { id, ...productDoc.data } as Product;
  const categories = categoryDocs.map((d) => ({ id: d.id, ...d.data } as Category));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Edit product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
