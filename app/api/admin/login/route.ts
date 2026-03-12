import { NextRequest, NextResponse } from "next/server";
import { computeToken, AUTH_COOKIE, COOKIE_OPTIONS } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const inputToken = await computeToken(password || "");
  const expectedToken = await computeToken(process.env.ADMIN_SECRET || "");

  // 타이밍 공격 방지: 해시 비교
  if (inputToken !== expectedToken) {
    return NextResponse.json({ error: "비밀번호 틀렸어" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, expectedToken, COOKIE_OPTIONS);
  return response;
}
