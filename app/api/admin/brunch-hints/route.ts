import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type FormatType = "bold" | "underline" | "strikethrough" | "핵심" | "bullet";

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
    "사용 가능한 서식 (4가지뿐):",
    "- bold: 굵게. 강조할 핵심 단어나 짧은 구. 이미 ** 로 감싸진 텍스트도 포함.",
    "- underline: 밑줄. 감정적으로 무게있는 짧은 문장. 선언적이거나 고백적인 문장.",
    "- strikethrough: 취소선. 이제 틀렸거나 과거의 생각, 반전되는 맥락의 텍스트.",
    "- 핵심: 글에서 가장 중요한 한두 문장. 독자가 하나만 기억한다면 이 문장. 아주 아끼는 경우에만 사용.",
    "- bullet: 마크다운에서 이미 - 또는 1. 로 작성된 불렛 목록 아이템. 변환 제안이 아니라, 이미 목록인 항목을 브런치에서도 불렛으로 유지하라는 가이드. text는 해당 목록 아이템의 정확한 텍스트.",
    "",
    "절대 하지 말 것:",
    "- color 서식 제안 (브런치에서 색상 변경 불가)",
    "- 쉼표 나열 단락을 불렛으로 바꾸라는 bullet 제안 (bullet은 이미 목록인 것만)",
    "- quote/인용 서식 제안 (이 목록에 없음)",
    "",
    "규칙:",
    `- text는 글에 실제로 존재하는 정확한 문자열 (마크다운 기호 ${mdSymbols} 제외)`,
    "- 최대 8개, 임팩트 있는 것만",
    "- JSON만 반환, 다른 텍스트 없이",
    "",
    "형식:",
    '{"suggestions":[{"text":"정확한 텍스트","format":"bold"}]}',
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
    // color/quote 혹시라도 나오면 필터링
    const filtered = (parsed.suggestions ?? []).filter(
      s => ["bold", "underline", "strikethrough", "핵심", "bullet"].includes(s.format)
    );
    return NextResponse.json({ suggestions: filtered });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
