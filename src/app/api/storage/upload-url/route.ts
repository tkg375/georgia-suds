import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-auth";
import { getSignedUploadUrl, getUploadAuthHeader } from "@/lib/firebase-storage";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
  }

  const uniqueName = `${Date.now()}-${filename}`;
  const { uploadUrl, publicUrl } = await getSignedUploadUrl(uniqueName, contentType);
  const authHeader = await getUploadAuthHeader();

  return NextResponse.json({ uploadUrl, publicUrl, authHeader });
}
