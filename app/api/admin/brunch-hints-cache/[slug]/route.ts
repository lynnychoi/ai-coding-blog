import { NextRequest, NextResponse } from "next/server";
import { getGitHubFile, commitToGitHub } from "../../../../../lib/github";
import { getExpectedToken, AUTH_COOKIE } from "../../../../../lib/auth";
import type { Suggestion } from "../../brunch-hints/route";

function authCheck(req: NextRequest, expected: string) {
  return req.cookies.get(AUTH_COOKIE)?.value === expected;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const expected = await getExpectedToken();
  if (!authCheck(req, expected)) return NextResponse.json({ error: "인증 실패" }, { status: 401 });

  const file = await getGitHubFile(`content/brunch-hints/${slug}.json`);
  if (!file) return NextResponse.json({ suggestions: null });

  try {
    const data = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8")) as { suggestions: Suggestion[] };
    return NextResponse.json({ suggestions: data.suggestions ?? null });
  } catch {
    return NextResponse.json({ suggestions: null });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const expected = await getExpectedToken();
  if (!authCheck(req, expected)) return NextResponse.json({ error: "인증 실패" }, { status: 401 });

  const { suggestions } = await req.json() as { suggestions: Suggestion[] };
  if (!suggestions) return NextResponse.json({ error: "suggestions 필요" }, { status: 400 });

  const path = `content/brunch-hints/${slug}.json`;
  const content = JSON.stringify({ suggestions }, null, 2);
  await commitToGitHub(path, content, `브런치 힌트 캐시: ${slug}`);

  return NextResponse.json({ ok: true });
}
