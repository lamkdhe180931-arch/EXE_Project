import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSessionCookieName, verifyAdminSession } from "@/lib/auth/session";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName())?.value;
  const session = token ? await verifyAdminSession(token) : null;
  if (!session) redirect("/admin/login");
  return session;
}
