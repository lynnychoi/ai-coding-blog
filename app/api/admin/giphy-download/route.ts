import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const expected = await getExpectedToken();
  if (req.cookies.get(AUTH_COOKIE)?.value !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url 파라미터 필요" }, { status: 400 });

  // Giphy URL만 허용 (SSRF 방지)
  if (!url.match(/^https?:\/\/media\.giphy\.com\//)) {
    return NextResponse.json({ error: "Giphy URL만 허용됩니다" }, { status: 400 });
  }

  // .gif URL로 강제 변환 (webp → gif)
  const gifUrl = url.replace(/\.(webp|mp4)(\?.*)?$/, ".gif");

  try {
    const res = await fetch(gifUrl, {
      headers: {
        "Accept": "image/gif",
        "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Giphy 응답 실패: ${res.status}` }, { status: 502 });
    }

    const buffer = await res.arrayBuffer();

    // 파일명 추출 (경로에서)
    const pathParts = new URL(gifUrl).pathname.split("/");
    const filename = pathParts[pathParts.length - 1] || "animation.gif";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/gif",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "다운로드 실패" }, { status: 500 });
  }
}
