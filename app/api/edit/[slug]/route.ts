import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getGitHubFile, commitToGitHub } from "../../../../lib/github";

const client = new Anthropic();

function today(): string {
  return new Date().toISOString().substring(0, 10);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const file = await getGitHubFile(`content/posts/${slug}.md`);
  if (!file) return NextResponse.json({ error: "없는 글이야" }, { status: 404 });
  return NextResponse.json({ markdown: file.content });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const formData = await req.formData();

  const password = formData.get("password") as string;
  if (password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "비밀번호 틀렸어" }, { status: 401 });
  }

  const instructions = formData.get("instructions") as string;

  // Upload new images if any
  const images: { path: string; description: string }[] = [];

  for (let i = 0; ; i++) {
    const file = formData.get(`image_${i}_file`) as File | null;
    if (!file || file.size === 0) break;

    const desc = (formData.get(`image_${i}_desc`) as string) || "";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const imagePath = `public/images/blog/${today()}-${safeName}`;
    const webPath = `/images/blog/${today()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    await commitImageToGitHub(imagePath, base64);
    images.push({ path: webPath, description: desc });
  }

  // Get current post
  const current = await getGitHubFile(`content/posts/${slug}.md`);
  if (!current) return NextResponse.json({ error: "없는 글이야" }, { status: 404 });

  // Read rules
  const rulesPath = path.join(process.cwd(), "prompts/blog-writing-rules.md");
  const rules = fs.readFileSync(rulesPath, "utf-8");

  const imageContext =
    images.length > 0
      ? `\n\n## 새로 추가된 이미지\n${images.map((img, i) => `${i + 1}. 경로: ${img.path}\n   설명: ${img.description}`).join("\n")}`
      : "";

  const prompt = `아래 블로그 글을 수정해줘.

## 수정 지시
${instructions}
${imageContext}

## 현재 글 (전체)
${current.content}

수정된 전체 마크다운을 아래 JSON 형식으로만 응답해줘:
{"markdown": "수정된 전체 마크다운 내용"}`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: rules,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "";

  let markdown: string;
  try {
    const clean = rawText.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(clean);
    markdown = parsed.markdown;
  } catch {
    return NextResponse.json({ error: "Claude 응답 파싱 실패", raw: rawText }, { status: 500 });
  }

  await commitToGitHub(`content/posts/${slug}.md`, markdown, `edit: ${slug}`);
  return NextResponse.json({ slug });
}

async function commitImageToGitHub(filePath: string, base64Content: string) {
  const OWNER = "lynnychoi";
  const REPO = "ai-coding-blog";

  const checkRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=main`,
    {
      headers: {
        Authorization: `token ${process.env.GH_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ai-coding-blog",
      },
      cache: "no-store",
    }
  );

  const body: Record<string, string> = {
    message: `add image: ${filePath}`,
    content: base64Content,
    branch: "main",
  };
  if (checkRes.ok) {
    const existing = await checkRes.json();
    body.sha = existing.sha;
  }

  await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${process.env.GH_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ai-coding-blog",
      },
      body: JSON.stringify(body),
    }
  );
}
