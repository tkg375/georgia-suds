import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-6">🧼</p>
      <h1 className="font-serif text-3xl text-stone-800 mb-3">Page not found</h1>
      <p className="text-stone-500 mb-8">This page doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="text-sm text-amber-800 hover:underline">
        Back to home
      </Link>
    </main>
  );
}
