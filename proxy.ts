import { NextRequest, NextResponse } from "next/server";
import { computeToken, AUTH_COOKIE } from "./lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 옛날 /admin 경로 → 404 (redirect 하면 새 경로가 노출됨)
  if (pathname.startsWith("/admin")) {
    return new NextResponse(null, { status: 404 });
  }

  // 로그인 페이지는 통과
  if (pathname === "/cooking/login") return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await computeToken(process.env.ADMIN_SECRET || "");

  if (token !== expected) {
    return NextResponse.redirect(new URL("/cooking/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/cooking", "/cooking/:path*"],
};
