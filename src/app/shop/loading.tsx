export default function ShopLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="h-10 w-20 bg-stone-100 rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-stone-100 animate-pulse aspect-[3/4]" />
        ))}
      </div>
    </main>
  );
}
