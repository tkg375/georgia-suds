import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-auth";
import { firestore } from "@/lib/firebase-admin";
import type { Order } from "@/lib/types";

export const runtime = "edge";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const docs = await firestore.listDocs("orders");
  const orders = docs
    .map((d) => ({ id: d.id, ...d.data } as Order))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ orders });
}
