"use client";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/types";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return <span className="text-xs text-stone-400">Out of stock</span>;
  }

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? "",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className="text-xs font-medium bg-amber-800 hover:bg-amber-900 text-white px-3 py-1.5 rounded-full transition"
    >
      {added ? "Added!" : "Add to cart"}
    </button>
  );
}
