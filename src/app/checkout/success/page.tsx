"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/cart-context";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">✨</div>
      <h1 className="font-serif text-3xl text-stone-800 mb-3">Thank you!</h1>
      <p className="text-stone-500 mb-8">
        Your order is confirmed. We&apos;ll get your soaps packed and on their way soon.
      </p>
      <Link
        href="/shop"
        className="inline-block bg-amber-800 hover:bg-amber-900 text-white font-medium px-6 py-2.5 rounded-full text-sm transition"
      >
        Continue shopping
      </Link>
    </main>
  );
}
