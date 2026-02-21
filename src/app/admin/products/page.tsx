import Link from "next/link";
import { firestore } from "@/lib/firebase-admin";
import type { Product } from "@/lib/types";
import DeleteProductButton from "./DeleteProductButton";

export const runtime = "edge";

export default async function AdminProductsPage() {
  const docs = await firestore.listDocs("products");
  const products = docs
    .map((d) => ({ id: d.id, ...d.data } as Product))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-stone-500 text-sm">No products yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{p.name}</td>
                  <td className="px-4 py-3 text-stone-600">${(p.price / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-stone-600">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link href={`/admin/products/${p.id}`} className="text-amber-700 hover:underline">
                      Edit
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
