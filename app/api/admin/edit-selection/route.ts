import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";
import { parseClaudeJson } from "../../../../lib/utils";

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 앞뒤 맥락으로 넘길 최대 글자 수 (선택 구간 편집 품질용, 토큰 절약)
const CONTEXT_CHARS = 800;

export async function POST(req: NextRequest) {
  try {
    const expected = await getExpectedToken();
    const cookie = req.cookies.get(AUTH_COOKIE)?.value;
    if (cookie !== expected) {
      return NextResponse.json({ error: "인증 실패" }, { status: 401 });
    }

    const { selection, instructions, before, after, postType } =
      (await req.json()) as {
        selection?: string;
        instructions?: string;
        before?: string;
        after?: string;
        postType?: string;
      };

    if (!selection || !instructions?.trim()) {
      return NextResponse.json(
        { error: "선택한 텍스트와 수정 지시가 모두 필요해요." },
        { status: 400 },
      );
    }

    // 블로그 원칙 로딩 (타입별 확장본 포함) — generate-edit과 동일 소스
    const rulesPath = path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES.md");
    let rules = fs.readFileSync(rulesPath, "utf-8");
    const extPath =
      postType === "writing"
        ? path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES-WRITING.md")
        : path.join(process.cwd(), "prompts/LYNN-BLOG-PRINCIPLES-DEV.md");
    if (fs.existsSync(extPath)) rules += "\n\n" + fs.readFileSync(extPath, "utf-8");

    const ctxBefore = (before ?? "").slice(-CONTEXT_CHARS);
    const ctxAfter = (after ?? "").slice(0, CONTEXT_CHARS);

    const prompt = `아래는 블로그 글의 일부를 발췌한 거야. 그중 <<<선택>>> 와 <<<선택끝>>> 사이의 부분만 아래 "수정 지시"대로 고쳐줘.

## 수정 지시
${instructions}

## ⚠️ 규칙 (반드시 지킬 것)
- **선택 구간(<<<선택>>>...<<<선택끝>>>) 안의 텍스트만** 고친다. 앞뒤 맥락은 어떻게 이어지는지 참고만 하고 절대 바꾸지 말고, 응답에도 포함하지 마.
- 선택 구간 안에서도 수정 지시와 무관한 표현·문장은 **최대한 그대로 유지**한다 (최소 수정).
- 선택 구간 안에 이미지·GIF 마크다운(예: \`![...](...giphy.gif)\`, \`![...](/images/...)\`)이 있으면, 지시에서 명시적으로 빼거나 바꾸라고 하지 않는 한 **그대로 둔다**.
- 마커(<<<선택>>>, <<<선택끝>>>)는 응답에 넣지 마.

## 발췌 (앞뒤 맥락 포함)
${ctxBefore}<<<선택>>>${selection}<<<선택끝>>>${ctxAfter}

수정된 '선택 구간'의 텍스트만 아래 JSON 형식으로 응답해줘:
{"text": "고친 선택 구간 텍스트"}`;

    let rawText: string;
    try {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        system: rules,
        messages: [{ role: "user", content: prompt }],
      });
      rawText = response.content[0].type === "text" ? response.content[0].text : "";
    } catch (e) {
      return NextResponse.json(
        { error: `Claude API 오류: ${String(e)}` },
        { status: 500 },
      );
    }

    let text: string;
    try {
      const parsed = parseClaudeJson<{ text: string }>(rawText);
      text = parsed.text;
    } catch {
      return NextResponse.json(
        { error: "Claude 응답 파싱 실패", raw: rawText },
        { status: 500 },
      );
    }

    return NextResponse.json({ text });
  } catch (e) {
    console.error("[edit-selection] unhandled error:", e);
    return NextResponse.json({ error: `서버 오류: ${String(e)}` }, { status: 500 });
  }
}
