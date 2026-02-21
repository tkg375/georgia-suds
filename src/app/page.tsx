import { firestore } from "@/lib/firebase-admin";
import type { Product } from "@/lib/types";
import Hero from "@/components/storefront/Hero";
import ProductGrid from "@/components/storefront/ProductGrid";
import Link from "next/link";

export const runtime = "edge";

export default async function HomePage() {
  const docs = await firestore.query(
    "products",
    [{ field: "active", op: "EQUAL", value: true }],
    "createdAt",
    "DESCENDING",
    6
  );
  const products = docs.map((d) => ({ id: d.id, ...d.data } as Product));

  return (
    <main>
      <Hero />
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl text-stone-800">Featured soaps</h2>
          <Link href="/shop" className="text-sm text-amber-800 hover:underline">View all →</Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
