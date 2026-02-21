"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-stone-200 flex flex-col">
      <div className="px-5 py-5 border-b border-stone-100">
        <p className="font-semibold text-amber-800 text-sm tracking-wide">The Gilded Bar</p>
        <p className="text-xs text-stone-400 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? "bg-amber-50 text-amber-800 font-medium"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-stone-100">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
