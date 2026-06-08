import { SignJWT, jwtVerify } from "jose";
import type { AdminSession } from "@/lib/auth/session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(`${secret}:csrf`);
}

export async function signAdminCsrf(session: AdminSession) {
  return new SignJWT({ adminId: session.adminId, email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyAdminCsrf(token: string, session: AdminSession) {
  try {
    const result = await jwtVerify(token, getSecret());
    return result.payload.adminId === session.adminId && result.payload.email === session.email;
  } catch {
    return false;
  }
}
