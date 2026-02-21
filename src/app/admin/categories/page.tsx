import { firestore } from "@/lib/firebase-admin";
import type { Category } from "@/lib/types";
import CategoryManager from "./CategoryManager";

export const runtime = "edge";

export default async function AdminCategoriesPage() {
  const docs = await firestore.listDocs("categories");
  const categories = docs.map((d) => ({ id: d.id, ...d.data } as Category));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Categories</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
