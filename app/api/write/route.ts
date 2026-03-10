import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { commitToGitHub } from "../../../lib/github";

const client = new Anthropic();

function today(): string {
  return new Date().toISOString().substring(0, 10);
}

function todayDatetime(): string {
  return new Date().toISOString().substring(0, 16).replace("T", "T");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const password = formData.get("password") as string;
  if (password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "비밀번호 틀렸어" }, { status: 401 });
  }

  const notes = formData.get("notes") as string;
  const tags = formData.get("tags") as string || "";
  const type = (formData.get("type") as string) || "dev";

  // Upload images to GitHub and collect paths + descriptions
  const images: { path: string; description: string }[] = [];
  const datePrefix = today();

  for (let i = 0; ; i++) {
    const file = formData.get(`image_${i}_file`) as File | null;
    if (!file || file.size === 0) break;

    const desc = (formData.get(`image_${i}_desc`) as string) || "";
    const ext = file.name.split(".").pop() || "png";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const imagePath = `public/images/blog/${datePrefix}-${safeName}`;
    const webPath = `/images/blog/${datePrefix}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    // commitToGitHub expects string content — encode binary as base64 directly via GitHub API
    await commitImageToGitHub(imagePath, base64);

    images.push({ path: webPath, description: desc });
  }

  // Read rules
  const rulesPath = path.join(process.cwd(), "prompts/blog-writing-rules.md");
  const rules = fs.readFileSync(rulesPath, "utf-8");

  // Build prompt
  const imageContext =
    images.length > 0
      ? `\n\n## 업로드된 이미지\n${images.map((img, i) => `${i + 1}. 경로: ${img.path}\n   설명: ${img.description}`).join("\n")}`
      : "";

  const prompt = `오늘 날짜: ${today()} (datetime용: ${todayDatetime()})
태그: ${tags}
타입: ${type}

## 메모 / 키워드
${notes}
${imageContext}

위 메모를 바탕으로 블로그 글을 작성해줘.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: rules,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON response
  let slug: string;
  let markdown: string;
  try {
    const clean = rawText.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(clean);
    slug = parsed.slug;
    markdown = parsed.markdown;
  } catch {
    return NextResponse.json({ error: "Claude 응답 파싱 실패", raw: rawText }, { status: 500 });
  }

  const filename = `content/posts/${today()}-${slug}.md`;
  await commitToGitHub(filename, markdown, `add: ${slug}`);

  return NextResponse.json({ slug: `${today()}-${slug}` });
}

// Image commit uses raw base64 directly
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
