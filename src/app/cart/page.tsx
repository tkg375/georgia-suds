"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalCents, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? "Checkout failed. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-xl font-serif text-stone-700 mb-4">Your cart is empty</p>
        <Link href="/shop" className="text-sm text-amber-800 hover:underline">
          Browse soaps →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl text-stone-800 mb-8">Your cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 bg-white border border-stone-100 rounded-xl p-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <span className="text-2xl flex items-center justify-center h-full">🧼</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 truncate">{item.name}</p>
              <p className="text-sm text-stone-500">${(item.price / 100).toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition"
              >
                +
              </button>
            </div>
            <p className="font-medium text-stone-800 w-16 text-right">
              ${((item.price * item.quantity) / 100).toFixed(2)}
            </p>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-stone-300 hover:text-red-400 transition text-lg ml-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="bg-stone-50 rounded-xl p-5 space-y-3">
        <div className="flex justify-between text-sm text-stone-600">
          <span>Subtotal</span>
          <span>${(totalCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-stone-400">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="border-t border-stone-200 pt-3 flex justify-between font-semibold text-stone-800">
          <span>Total</span>
          <span>${(totalCents / 100).toFixed(2)}</span>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-amber-800 hover:bg-amber-900 text-white font-medium py-3 rounded-xl transition text-sm disabled:opacity-60"
        >
          {loading ? "Redirecting to checkout…" : "Proceed to checkout"}
        </button>
        <button
          onClick={clearCart}
          className="w-full text-xs text-stone-400 hover:text-red-400 transition py-1"
        >
          Clear cart
        </button>
      </div>
    </main>
  );
}
