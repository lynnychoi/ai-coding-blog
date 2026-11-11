import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type FormatType = "bold" | "underline" | "strikethrough" | "핵심" | "color" | "bullet";

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
    "브런치에 올릴 글을 분석해서 서식 적용 위치를 제안해줘.",
    "",
    "브런치 서식 현실:",
    "- bold(굵게)와 underline(밑줄)은 미묘하게 강조됨. 너무 많으면 의미 없음.",
    "- color(색상)는 가장 눈에 띄지만 과하면 촌스러움. 글 전체에서 1~2개만.",
    "- 핵심은 브런치의 큰 인용구(\" \" 스타일). 임팩트 크지만 글 전체에서 딱 1개.",
    "- strikethrough(취소선)은 반전/유머 효과. 맥락 맞을 때만.",
    "- quote(왼쪽 선 인용)는 브런치에서 별로 안 띄어서 사용 안 함.",
    "",
    "사용 가능한 서식:",
    "- bold: 굵게. 핵심 단어/구. 이미 ** 로 감싸진 것 포함. 글 전체 3~5개 이내.",
    "- underline: 밑줄. 감정적으로 무게있는 짧은 선언문. 1~2개.",
    "- strikethrough: 취소선. 틀렸거나 반전되는 맥락. 있을 때만.",
    "- color: 색상 강조. 글에서 가장 기억에 남았으면 하는 핵심 구/문장. 최대 2개.",
    "- 핵심: 브런치 큰 인용구. 글 전체 메시지를 대표하는 딱 1문장. 글 전체에서 1개만. 없어도 됨.",
    "- bullet: 마크다운에서 이미 - 또는 1. 로 쓰인 목록만. 변환 제안 아님.",
    "",
    "규칙:",
    `- text는 글에 실제로 존재하는 정확한 문자열 (마크다운 기호 ${mdSymbols} 제외)`,
    "- 전체 제안 최대 6개. 많을수록 의미 없어짐.",
    "- quote 서식은 절대 제안하지 말 것",
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
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ suggestions: [] });

    const parsed = JSON.parse(jsonMatch[0]) as { suggestions: Suggestion[] };
    // color/quote 혹시라도 나오면 필터링
    const filtered = (parsed.suggestions ?? []).filter(
      s => ["bold", "underline", "strikethrough", "핵심", "color", "bullet"].includes(s.format)
    );
    return NextResponse.json({ suggestions: filtered });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
