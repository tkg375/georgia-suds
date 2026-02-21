import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">🛒</div>
      <h1 className="font-serif text-3xl text-stone-800 mb-3">Order cancelled</h1>
      <p className="text-stone-500 mb-8">No worries — your cart is still saved.</p>
      <Link
        href="/cart"
        className="inline-block bg-amber-800 hover:bg-amber-900 text-white font-medium px-6 py-2.5 rounded-full text-sm transition"
      >
        Back to cart
      </Link>
    </main>
  );
}
