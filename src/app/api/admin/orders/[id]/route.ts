import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-auth";
import { firestore } from "@/lib/firebase-admin";
import type { Order, OrderStatus } from "@/lib/types";

export const runtime = "edge";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? verifyAdminToken(token) : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const doc = await firestore.getDoc("orders", id);
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: { id, ...doc.data } as Order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  const validStatuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await firestore.updateDoc("orders", id, { status });
  return NextResponse.json({ success: true });
}
