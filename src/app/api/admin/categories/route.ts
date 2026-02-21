import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-auth";
import { firestore } from "@/lib/firebase-admin";
import type { Category } from "@/lib/types";

export const runtime = "edge";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? verifyAdminToken(token) : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const docs = await firestore.listDocs("categories");
  const categories = docs.map((d) => ({ id: d.id, ...d.data } as Category));
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, slug } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });
  const id = await firestore.addDoc("categories", { name, slug });
  return NextResponse.json({ category: { id, name, slug } }, { status: 201 });
}
