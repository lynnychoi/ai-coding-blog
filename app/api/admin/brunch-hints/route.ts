import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type FormatType = "bold" | "underline" | "strikethrough" | "color" | "bullet";

export type Suggestion = {
  text: string;
  format: FormatType;
};

export async function POST(req: NextRequest) {
  const expected = await getExpectedToken();
  if (req.cookies.get(AUTH_COOKIE)?.value !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { body } = await req.json() as { body: string };
  if (!body?.trim()) return NextResponse.json({ suggestions: [] });

  const mdSymbols = "** * ~~ ` []()";
  const prompt = [
    "브런치 에디터에 붙여넣을 글을 분석해서, 어떤 텍스트에 어떤 서식을 추가하면 좋을지 제안해줘.",
    "",
    "브런치에서 가능한 서식:",
    "- bold: 굵게 (강조할 핵심 단어/구)",
    "- underline: 밑줄 (감정적으로 무게있는 짧은 문장)",
    "- strikethrough: 취소선 (이제 틀렸거나 반전되는 맥락의 텍스트)",
    "- color: 색상 강조 (글 전체의 핵심 메시지)",
    "- bullet: 불렛포인트 변환 추천 (쉼표 나열로 된 단락 — text는 그 단락 첫 10자)",
    "",
    "규칙:",
    `- text는 글에 실제로 존재하는 정확한 문자열 (마크다운 기호 ${mdSymbols} 제외하고)`,
    "- 너무 많이 제안하지 말고 임팩트 있는 것만, 최대 10개",
    "- 이미 ** 로 볼드 처리된 텍스트도 bold 제안에 포함해줘 (브런치에서 다시 적용해야 하므로)",
    "- JSON만 반환, 다른 텍스트 없이",
    "",
    '형식:',
    '{"suggestions":[{"text":"정확한 텍스트","format":"bold"},{"text":"정확한 텍스트","format":"underline"}]}',
    "",
    "글:",
    body,
  ].join("\n");

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ suggestions: [] });

    const parsed = JSON.parse(jsonMatch[0]) as { suggestions: Suggestion[] };
    return NextResponse.json({ suggestions: parsed.suggestions ?? [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
