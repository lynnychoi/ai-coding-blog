import { NextRequest, NextResponse } from "next/server";
import { computeToken, AUTH_COOKIE } from "./lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 로그인 페이지는 통과
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await computeToken(process.env.ADMIN_SECRET || "");

  if (token !== expected) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
