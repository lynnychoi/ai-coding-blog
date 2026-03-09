import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export interface Comment {
  id: string;
  slug: string;
  name: string;
  content: string;
  createdAt: string;
}

async function getComments(slug: string): Promise<Comment[]> {
  try {
    const data = await kv.get<Comment[]>(`comments:${slug}`);
    return data ?? [];
  } catch {
    return [];
  }
}

// GET /api/comments/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const comments = await getComments(slug);
  return NextResponse.json(comments);
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
    return NextResponse.json({ error: "이름과 내용을 입력해주세요." }, { status: 400 });
  }

  const comment: Comment = {
    id: nanoid(10),
    slug,
    name,
    content,
    createdAt: new Date().toISOString(),
  };

  const existing = await getComments(slug);
  await kv.set(`comments:${slug}`, [...existing, comment]);

  return NextResponse.json(comment, { status: 201 });
}

// DELETE /api/comments/[slug]?id=xxx  (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await getComments(slug);
  const updated = existing.filter((c) => c.id !== id);
  await kv.set(`comments:${slug}`, updated);

  return NextResponse.json({ success: true, deleted: id });
}
