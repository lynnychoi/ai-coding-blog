import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const expected = await getExpectedToken();
  if (req.cookies.get(AUTH_COOKIE)?.value !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url 파라미터 필요" }, { status: 400 });

  let parsedUrl: URL;
  try { parsedUrl = new URL(url); } catch {
    return NextResponse.json({ error: "잘못된 URL" }, { status: 400 });
  }

  // 허용된 도메인만 프록시 (SSRF 방지)
  const ALLOWED = ["raw.githubusercontent.com", "github.com", "ai-coding-blog.vercel.app"];
  if (!ALLOWED.some(h => parsedUrl.hostname.endsWith(h))) {
    // 허용 목록 외 URL은 리다이렉트로 처리
    return NextResponse.redirect(url);
  }

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: "이미지 가져오기 실패" }, { status: 502 });

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const pathParts = parsedUrl.pathname.split("/");
  const filename = pathParts[pathParts.length - 1] || "image.jpg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
