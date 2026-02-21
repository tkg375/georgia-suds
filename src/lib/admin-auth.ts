import { SignJWT, jwtVerify } from "jose";
import type { AdminJWTPayload } from "./types";

const COOKIE_NAME = "admin-session";
const SECRET = () => new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "change-me");

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET());
}

export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET());
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
