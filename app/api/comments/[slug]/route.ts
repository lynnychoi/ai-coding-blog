import { NextRequest, NextResponse } from "next/server";

const REPO = "lynnychoi/ai-coding-blog";
const GH_TOKEN = process.env.GH_TOKEN!;

function ghHeaders() {
  return {
    Authorization: `token ${GH_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
}

// 포스트 슬러그에 해당하는 이슈 번호 찾기 (없으면 생성)
async function getOrCreateIssue(slug: string): Promise<number> {
  const searchRes = await fetch(
    `https://api.github.com/repos/${REPO}/issues?labels=comments&state=open&per_page=100`,
    { headers: ghHeaders() }
  );
  const issues = await searchRes.json();

  const existing = issues.find(
    (i: { title: string; number: number }) => i.title === `[comments] ${slug}`
  );
  if (existing) return existing.number;

  // 없으면 새 이슈 생성
  const createRes = await fetch(
    `https://api.github.com/repos/${REPO}/issues`,
    {
      method: "POST",
      headers: ghHeaders(),
      body: JSON.stringify({
        title: `[comments] ${slug}`,
        body: "블로그 댓글 저장소 (자동 생성)",
        labels: ["comments"],
      }),
    }
  );
  const created = await createRes.json();
  return created.number;
}

export interface Comment {
  id: number;
  name: string;
  content: string;
  createdAt: string;
}

function parseComment(body: string): { name: string; content: string } | null {
  try {
    const match = body.match(/^<!-- name: (.+?) -->\n([\s\S]+)$/);
    if (!match) return null;
    return { name: match[1], content: match[2].trim() };
  } catch {
    return null;
  }
}

// GET /api/comments/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const issueNumber = await getOrCreateIssue(slug);
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/issues/${issueNumber}/comments?per_page=100`,
      { headers: ghHeaders(), next: { revalidate: 30 } }
    );
    const ghComments = await res.json();

    const comments: Comment[] = ghComments
      .map((c: { id: number; body: string; created_at: string }) => {
        const parsed = parseComment(c.body);
        if (!parsed) return null;
        return {
          id: c.id,
          name: parsed.name,
          content: parsed.content,
          createdAt: c.created_at,
        };
      })
      .filter(Boolean);

    return NextResponse.json(comments);
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/comments/[slug]
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();

  const name = String(body.name ?? "").trim().slice(0, 50);
  const content = String(body.content ?? "").trim().slice(0, 1000);

  if (!name || !content) {
    return NextResponse.json(
      { error: "이름과 내용을 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const issueNumber = await getOrCreateIssue(slug);

    const res = await fetch(
      `https://api.github.com/repos/${REPO}/issues/${issueNumber}/comments`,
      {
        method: "POST",
        headers: ghHeaders(),
        body: JSON.stringify({
          body: `<!-- name: ${name} -->\n${content}`,
        }),
      }
    );
    const created = await res.json();

    return NextResponse.json(
      {
        id: created.id,
        name,
        content,
        createdAt: created.created_at,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "댓글 등록에 실패했어요." }, { status: 500 });
  }
}

// DELETE /api/comments/[slug]?commentId=xxx  (admin only)
export async function DELETE(
  req: NextRequest,
  _ctx: { params: Promise<{ slug: string }> }
) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commentId = req.nextUrl.searchParams.get("commentId");
  if (!commentId) {
    return NextResponse.json({ error: "commentId required" }, { status: 400 });
  }

  try {
    await fetch(
      `https://api.github.com/repos/${REPO}/issues/comments/${commentId}`,
      { method: "DELETE", headers: ghHeaders() }
    );
    return NextResponse.json({ success: true, deleted: commentId });
  } catch {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
