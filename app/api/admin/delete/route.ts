import { NextRequest, NextResponse } from "next/server";
import { getGitHubFile } from "../../../../lib/github";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export async function DELETE(req: NextRequest) {
  const expected = await getExpectedToken();
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { slug } = await req.json() as { slug: string };
  if (!slug) return NextResponse.json({ error: "slug 없음" }, { status: 400 });

  const filePath = `content/posts/${slug}.md`;
  const file = await getGitHubFile(filePath);
  if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 404 });

  const res = await fetch(
    `https://api.github.com/repos/lynnychoi/ai-coding-blog/contents/${filePath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `token ${process.env.GH_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ai-coding-blog",
      },
      body: JSON.stringify({
        message: `delete: ${slug}`,
        sha: file.sha,
        branch: "main",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `삭제 실패: ${err}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
