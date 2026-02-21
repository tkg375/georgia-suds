import { db } from "@/lib/db";
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

  const [products, categories] = await Promise.all([
    db.queryProducts({ activeOnly: true, category }),
    db.listCategories(),
  ]);

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
