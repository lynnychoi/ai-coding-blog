import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type FormatType = "bold" | "color" | "핵심";

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

  // 마크다운에서 이미 볼드된 텍스트 추출 (** **)
  const existingBold: Suggestion[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let m;
  while ((m = boldRegex.exec(body)) !== null) {
    existingBold.push({ text: m[1], format: "bold" });
  }

  const mdSymbols = "** * ~~ ` []()";
  const alreadyBolded = existingBold.map(s => `"${s.text}"`).join(", ");

  const prompt = [
    "브런치에 올릴 글에서 추가 서식 위치를 제안해줘.",
    "",
    "이미 볼드 처리된 텍스트 (추가 bold 제안 불필요):",
    alreadyBolded || "(없음)",
    "",
    "제안 가능한 서식 (3가지만):",
    "- bold: 위 목록에 없는 텍스트 중 굵게 강조할 핵심 단어/구. 최대 3개.",
    "- color: 색상 강조. 글 전체에서 가장 기억에 남았으면 하는 구/문장. 최대 1개.",
    "- 핵심: 브런치 큰 인용구 스타일. 글 전체를 대표하는 딱 1문장. 없어도 됨.",
    "",
    "규칙:",
    `- text는 글에 실제로 존재하는 정확한 문자열 (마크다운 기호 ${mdSymbols} 제외)`,
    "- 전체 제안 최대 5개",
    "- JSON만 반환",
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
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const aiSuggestions: Suggestion[] = jsonMatch
      ? ((JSON.parse(jsonMatch[0]) as { suggestions?: Suggestion[] }).suggestions ?? [])
          .filter(s => ["bold", "color", "핵심"].includes(s.format))
      : [];

    // 기존 볼드 + AI 추가 제안 합치기
    const suggestions = [...existingBold, ...aiSuggestions];
    return NextResponse.json({ suggestions });
  } catch {
    // AI 실패해도 기존 볼드는 반환
    return NextResponse.json({ suggestions: existingBold });
  }
}
