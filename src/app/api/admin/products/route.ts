import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-auth";
import { firestore } from "@/lib/firebase-admin";
import type { Product } from "@/lib/types";

export const runtime = "edge";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? verifyAdminToken(token) : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const docs = await firestore.listDocs("products");
  const products = docs.map((d) => ({ id: d.id, ...d.data } as Product));
  products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const data = {
    name: body.name,
    slug: body.slug,
    description: body.description,
    price: Number(body.price),
    images: body.images ?? [],
    stock: Number(body.stock),
    category: body.category ?? "",
    active: body.active ?? true,
    createdAt: new Date().toISOString(),
  };
  const id = await firestore.addDoc("products", data);
  return NextResponse.json({ product: { id, ...data } }, { status: 201 });
}
