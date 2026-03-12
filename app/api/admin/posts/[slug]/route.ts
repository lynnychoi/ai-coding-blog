import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { getGitHubFile, commitToGitHub } from "../../../../../lib/github";
import { getExpectedToken, AUTH_COOKIE } from "../../../../../lib/auth";

function authCheck(req: NextRequest, expected: string) {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  return cookie === expected;
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

  const file = await getGitHubFile(`content/posts/${slug}.md`);
  if (!file) return NextResponse.json({ error: "없는 글이야" }, { status: 404 });

  const { data, content } = matter(file.content);

  // Extract title from first H1 line if not in frontmatter
  const titleFromBody = content.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const bodyWithoutTitle = content.replace(/^#\s+.+\n?/m, "").trim();

  const date = data.date instanceof Date
    ? data.date.toISOString().substring(0, 10)
    : String(data.date ?? "");
  const datetime = data.datetime instanceof Date
    ? data.datetime.toISOString().substring(0, 16)
    : String(data.datetime ?? "");

  return NextResponse.json({
    markdown: file.content,
    sha: file.sha,
    fields: {
      title: String(data.title ?? titleFromBody),
      date,
      datetime,
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : String(data.tags ?? ""),
      type: String(data.type ?? "dev"),
      notes: String(data.notes ?? ""),
    },
    body: bodyWithoutTitle,
  });
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

  const { markdown } = await req.json() as { markdown: string };
  if (!markdown) return NextResponse.json({ error: "내용 없음" }, { status: 400 });

  await commitToGitHub(`content/posts/${slug}.md`, markdown, `edit: ${slug}`);
  return NextResponse.json({ slug });
}
