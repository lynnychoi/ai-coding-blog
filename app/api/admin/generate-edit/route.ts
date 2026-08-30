import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";
import { commitToGitHub, commitImageToGitHub } from "../../../../lib/github";
import { today, parseClaudeJson } from "../../../../lib/utils";

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

## ⚠️ 최소 수정 원칙 (매우 중요 — 반드시 지킬 것)
너의 임무는 위 "수정 지시"가 요청한 부분만 바꾸는 것이다. **그 외의 모든 것은 원본 그대로 유지한다.**
1. **저자 문장 보존**: 지시가 언급하지 않은 문장·표현·문단은 **글자 그대로(verbatim) 보존**한다.
   다듬거나, 바꿔 쓰거나, 매끄럽게 고치거나, 이전 버전으로 되돌리지 마라.
   저자가 직접 쓰거나 고친 표현을 네 문체로 "개선"하지 마라 — 지시에 없으면 손대지 않는다.
2. **미디어 보존**: 이미지·GIF 마크다운(\`![...](...giphy.gif)\`, \`![...](/images/...)\` — 저자가
   직접 업로드한 이미지 포함)은 지시에서 명시적으로 "빼줘/바꿔줘/옮겨줘"라고 하지 않는 한
   삭제·이동하지 말고 그대로 둔다. 문단 구조가 바뀌면 문맥에 맞게만 함께 옮기고 **개수는 유지**한다.
3. **의심되면 유지**: 바꿔야 할지 확신이 안 서면, 바꾸지 말고 원본을 그대로 둔다.

→ 결과적으로 원본과 수정본의 차이(diff)는 "수정 지시"가 요구한 최소한이어야 한다.

## 현재 글 (전체)
${currentMarkdown}

수정된 전체 마크다운을 아래 JSON 형식으로만 응답해줘. (위 '최소 수정 원칙' 반드시 지킬 것)
{"markdown": "수정된 전체 마크다운 내용"}`;

  let rawText: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
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
    const parsed = parseClaudeJson<{ markdown: string }>(rawText);
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
