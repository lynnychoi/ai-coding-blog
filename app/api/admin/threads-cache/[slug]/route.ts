import { NextRequest, NextResponse } from "next/server";
import { getGitHubFile, commitToGitHub } from "../../../../../lib/github";
import { getExpectedToken, AUTH_COOKIE } from "../../../../../lib/auth";

function authCheck(req: NextRequest, expected: string) {
  return req.cookies.get(AUTH_COOKIE)?.value === expected;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const expected = await getExpectedToken();
  if (!authCheck(req, expected)) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const file = await getGitHubFile(`content/threads/${slug}.json`);
  if (!file) return NextResponse.json({ posts: null });

  try {
    const data = JSON.parse(file.content) as { posts: string[] };
    return NextResponse.json({ posts: data.posts ?? null });
  } catch {
    return NextResponse.json({ posts: null });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const expected = await getExpectedToken();
  if (!authCheck(req, expected)) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { posts } = await req.json() as { posts: string[] };
  if (!Array.isArray(posts)) {
    return NextResponse.json({ error: "posts 배열 필요" }, { status: 400 });
  }

  await commitToGitHub(
    `content/threads/${slug}.json`,
    JSON.stringify({ posts }, null, 2),
    `threads: ${slug}`
  );

  return NextResponse.json({ ok: true });
}
