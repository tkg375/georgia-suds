import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-amber-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-28 md:py-40 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-amber-700 mb-4">Handcrafted with care</p>
        <h1 className="font-serif text-5xl md:text-7xl text-stone-900 leading-tight mb-6">
          The Gilded Bar
        </h1>
        <p className="text-lg text-stone-500 max-w-md mx-auto mb-10">
          Small-batch artisan soaps made from natural ingredients. Each bar is a little luxury.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-amber-800 hover:bg-amber-900 text-white font-medium px-8 py-3 rounded-full transition text-sm tracking-wide"
        >
          Shop all soaps
        </Link>
      </div>
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-200 rounded-full opacity-30 blur-2xl pointer-events-none" />
    </section>
  );
}
