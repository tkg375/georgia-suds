import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug}`} className="relative aspect-square bg-stone-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">🧼</div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-medium text-stone-500 tracking-wide">Sold out</span>
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-stone-800 hover:text-amber-800 transition">{product.name}</h3>
        </Link>
        <p className="text-sm text-stone-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-stone-800">${(product.price / 100).toFixed(2)}</span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
