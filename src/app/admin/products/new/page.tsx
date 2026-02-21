import { firestore } from "@/lib/firebase-admin";
import type { Category } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

export const runtime = "edge";

export default async function NewProductPage() {
  const docs = await firestore.listDocs("categories");
  const categories = docs.map((d) => ({ id: d.id, ...d.data } as Category));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
