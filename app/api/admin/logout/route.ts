import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/lib/auth/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.delete(adminSessionCookieName());
  return response;
}
