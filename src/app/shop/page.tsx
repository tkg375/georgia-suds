import { firestore } from "@/lib/firebase-admin";
import type { Product, Category } from "@/lib/types";
import ProductGrid from "@/components/storefront/ProductGrid";
import CategoryFilter from "@/components/storefront/CategoryFilter";
import { Suspense } from "react";

export const runtime = "edge";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const filters: Array<{ field: string; op: string; value: unknown }> = [
    { field: "active", op: "EQUAL", value: true },
  ];
  if (category) filters.push({ field: "category", op: "EQUAL", value: category });

  const [productDocs, categoryDocs] = await Promise.all([
    firestore.query("products", filters, "createdAt", "DESCENDING"),
    firestore.listDocs("categories"),
  ]);

  const products = productDocs.map((d) => ({ id: d.id, ...d.data } as Product));
  const categories = categoryDocs.map((d) => ({ id: d.id, ...d.data } as Category));

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl text-stone-800 mb-8">Shop</h1>
      <div className="mb-8">
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}
