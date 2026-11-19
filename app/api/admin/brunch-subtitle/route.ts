import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const expected = await getExpectedToken();
  if (req.cookies.get(AUTH_COOKIE)?.value !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { title, body } = await req.json() as { title?: string; body?: string };
  if (!body?.trim()) return NextResponse.json({ subtitles: [] });

  const prompt = [
    "아래 블로그 글의 브런치 소제목(대제목 바로 밑 한 줄 설명)을 3개 제안해줘.",
    "",
    "규칙:",
    "- 20자 이내. 짧고 임팩트 있게.",
    "- 반말 또는 명사형 마무리 (\"~한 이야기\", \"~의 기록\" 등).",
    "- 글쓴이 톤(솔직하고 털털함) 유지. 마케팅 문구 금지.",
    "- 3개 모두 다른 각도에서 (감정 / 사건 / 교훈 등).",
    "- JSON만 반환.",
    "",
    `제목: ${title ?? ""}`,
    "",
    `본문 첫 부분:\n${body.slice(0, 600)}`,
    "",
    '{"subtitles":["옵션1","옵션2","옵션3"]}',
  ].join("\n");

  const msg = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
  const match = raw.match(/\{[\s\S]*\}/);
  const subtitles: string[] = match
    ? ((JSON.parse(match[0]) as { subtitles?: string[] }).subtitles ?? [])
    : [];

  return NextResponse.json({ subtitles });
}
