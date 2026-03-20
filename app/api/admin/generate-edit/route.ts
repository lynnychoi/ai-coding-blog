import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";
import { commitToGitHub } from "../../../../lib/github";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function today() {
  return new Date().toISOString().substring(0, 10);
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
    }
  );

  const body: Record<string, string> = {
    message: `add image: ${filePath}`,
    content: base64Content,
    branch: "main",
  };
  if (checkRes.ok) {
    const existing = await checkRes.json() as { sha: string };
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

export async function POST(req: NextRequest) {
  try {
  const expected = await getExpectedToken();
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const formData = await req.formData();
  const currentMarkdown = formData.get("markdown") as string;
  const instructions = formData.get("instructions") as string;
  const slug = formData.get("slug") as string;
  const commit = formData.get("commit") === "true";

  // Upload images if any
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

  const rulesPath = path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES.md");
  let rules = fs.readFileSync(rulesPath, "utf-8");
  const typeMatch = currentMarkdown.match(/^type:\s*(\S+)/m);
  const postType = typeMatch?.[1] ?? "dev";
  const extPath = postType === "writing"
    ? path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES-WRITING.md")
    : path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES-DEV.md");
  if (fs.existsSync(extPath)) rules += "\n\n" + fs.readFileSync(extPath, "utf-8");

  const imageContext =
    images.length > 0
      ? `\n\n## 새로 추가된 이미지\n${images.map((img, i) => `${i + 1}. 경로: ${img.path}\n   설명: ${img.description}`).join("\n")}`
      : "";

  const prompt = `아래 블로그 글을 수정해줘.

## 수정 지시
${instructions}
${imageContext}

## 현재 글 (전체)
${currentMarkdown}

수정된 전체 마크다운을 아래 JSON 형식으로만 응답해줘:
{"markdown": "수정된 전체 마크다운 내용"}`;

  let rawText: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      system: rules,
      messages: [{ role: "user", content: prompt }],
    });
    rawText = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (e) {
    return NextResponse.json({ error: `Claude API 오류: ${String(e)}` }, { status: 500 });
  }

  let markdown: string;
  try {
    const clean = rawText.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(clean) as { markdown: string };
    markdown = parsed.markdown;
  } catch {
    return NextResponse.json({ error: "Claude 응답 파싱 실패", raw: rawText }, { status: 500 });
  }

  if (commit && slug) {
    await commitToGitHub(`content/posts/${slug}.md`, markdown, `edit: ${slug}`);
    return NextResponse.json({ slug, markdown, committed: true });
  }

  return NextResponse.json({ markdown, committed: false });
  } catch (e) {
    console.error("[generate-edit] unhandled error:", e);
    return NextResponse.json({ error: `서버 오류: ${String(e)}` }, { status: 500 });
  }
}
