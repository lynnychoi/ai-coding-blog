import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { commitToGitHub, commitImageToGitHub } from "../../../lib/github";
import { getExpectedToken, AUTH_COOKIE } from "../../../lib/auth";
import { today, parseClaudeJson } from "../../../lib/utils";
import { invalidatePostsCache } from "../../../lib/posts";

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const password = formData.get("password") as string | null;
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  const expectedToken = await getExpectedToken();
  const isValidCookie = cookie === expectedToken;
  const isValidPassword = password === process.env.ADMIN_SECRET;
  if (!isValidCookie && !isValidPassword) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const notes = formData.get("notes") as string;
  const prompt = (formData.get("prompt") as string) || "";
  const tags = formData.get("tags") as string || "";
  const type = (formData.get("type") as string) || "dev";
  const date = (formData.get("date") as string) || today();
  const status = (formData.get("status") as string) === "unpublished" ? "unpublished" : "published";

  // Upload images to GitHub and collect paths + descriptions
  const images: { path: string; description: string }[] = [];
  const datePrefix = date;

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

  const rulesPath = path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES.md");
  let rules = fs.readFileSync(rulesPath, "utf-8");
  const extPath = type === "writing"
    ? path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES-WRITING.md")
    : path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES-DEV.md");
  if (fs.existsSync(extPath)) rules += "\n\n" + fs.readFileSync(extPath, "utf-8");

  // Build prompt
  const imageContext =
    images.length > 0
      ? `\n\n## 업로드된 이미지\n${images.map((img, i) => `${i + 1}. 경로: ${img.path}\n   설명: ${img.description}`).join("\n")}`
      : "";

  const promptText = `오늘 날짜: ${date} (datetime용: ${date}T00:00)
태그: ${tags}
타입: ${type}
공개여부: ${status}

## 재료 / 원본 메모 (frontmatter의 notes 필드에 그대로 저장해줘)
${notes}
${imageContext}
${prompt.trim() ? `\n## 추가 지시\n${prompt}` : ""}
위 재료를 바탕으로 블로그 글을 작성해줘. frontmatter의 notes 필드에는 위 원본 메모를 그대로 넣어줘.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: rules,
    messages: [{ role: "user", content: promptText }],
  });
  const rawText = response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON response
  let slug: string;
  let markdown: string;
  try {
    const parsed = parseClaudeJson<{ slug: string; markdown: string }>(rawText);
    slug = parsed.slug;
    markdown = parsed.markdown;
  } catch {
    return NextResponse.json({ error: `Claude 응답 파싱 실패: ${rawText.substring(0, 200)}` }, { status: 500 });
  }

  const filename = `content/posts/${date}-${slug}.md`;
  await commitToGitHub(filename, markdown, `add: ${slug}`);
  invalidatePostsCache();

  // generation-log 저장 (로컬 전용 — Vercel은 파일시스템이 읽기전용이라 무시)
  try {
    const logDir = path.join(process.cwd(), "logs/generation-log");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logFile = path.join(logDir, `${date}-${slug}.md`);
    const timestamp = new Date().toISOString().substring(0, 16);
    const newEntry = `## v — ${timestamp}\n- **재료**: ${notes.replace(/\n/g, " ").substring(0, 200)}${notes.length > 200 ? "..." : ""}\n- **추가 프롬프트**: ${prompt.trim() || "없음"}\n- **태그**: ${tags || "없음"}\n- **타입**: ${type}\n\n---\n\n`;

    if (fs.existsSync(logFile)) {
      const existing = fs.readFileSync(logFile, "utf-8");
      const headerEnd = existing.indexOf("\n\n") + 2;
      fs.writeFileSync(logFile, existing.substring(0, headerEnd) + newEntry + existing.substring(headerEnd));
    } else {
      fs.writeFileSync(logFile, `# ${date}-${slug}\n\n` + newEntry);
    }
  } catch { /* 로컬 전용 로그, 실패해도 무시 */ }

  return NextResponse.json({ slug: `${date}-${slug}` });
}

