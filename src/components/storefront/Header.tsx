"use client";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-amber-900 tracking-wide">
          The Gilded Bar
        </Link>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-stone-600">
          <Link href="/shop" className="hover:text-amber-800 transition">Shop</Link>
        </nav>
        <Link href="/cart" className="relative flex items-center gap-1.5 text-sm text-stone-700 hover:text-amber-800 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
