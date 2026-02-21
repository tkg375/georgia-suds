import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
