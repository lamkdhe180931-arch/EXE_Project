import { SignJWT, jwtVerify } from "jose";

const cookieName = "artdict_admin_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export type AdminSession = {
  adminId: string;
  email: string;
  role: string;
};

export function adminSessionCookieName() {
  return cookieName;
}

export async function signAdminSession(session: AdminSession) {
  return new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(getSecret());
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const result = await jwtVerify(token, getSecret());
    const payload = result.payload as Partial<AdminSession>;
    if (!payload.adminId || !payload.email || !payload.role) return null;
    return { adminId: payload.adminId, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}
