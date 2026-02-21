import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase-admin";
import type { Product, Category } from "@/lib/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "0", 10);

  const filters: Array<{ field: string; op: string; value: unknown }> = [
    { field: "active", op: "EQUAL", value: true },
  ];
  if (category) filters.push({ field: "category", op: "EQUAL", value: category });

  const [productDocs, categoryDocs] = await Promise.all([
    firestore.query("products", filters, "createdAt", "DESCENDING", featured ? 6 : limit || undefined),
    firestore.listDocs("categories"),
  ]);

  const products = productDocs.map((d) => ({ id: d.id, ...d.data } as Product));
  const categories = categoryDocs.map((d) => ({ id: d.id, ...d.data } as Category));

  return NextResponse.json({ products, categories });
}
