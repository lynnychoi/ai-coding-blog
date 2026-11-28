import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type SpellIssue = {
  original: string;
  suggestion: string;
  reason: string;
  offset: number;
};

export async function POST(req: NextRequest) {
  const expected = await getExpectedToken();
  if (req.cookies.get(AUTH_COOKIE)?.value !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { body } = await req.json() as { body?: string };
  if (!body?.trim()) return NextResponse.json({ issues: [] });

  const prompt = `아래 한국어 블로그 글에서 맞춤법·띄어쓰기 오류를 꼼꼼히 찾아줘.

특히 아래 항목을 반드시 확인해:
- 되/돼 혼용 (예: "안 되" vs "안 돼", "됬다" → "됐다")
- 띄어쓰기 (예: "할수있다" → "할 수 있다", "것같다" → "것 같다", "안했다" → "안 했다")
- 어/아 오류 (예: "만들어" vs "만들어", "담아" vs "담어")
- 이/히 혼용 (예: "솔직이" → "솔직히", "특별이" → "특별히")
- 맞춤법 (예: "어떻해" → "어떻게", "왠만하면" → "웬만하면", "어의없다" → "어이없다")
- 조사·어미 오류

규칙:
- original은 body에서 정확히 그대로 찾을 수 있는 텍스트여야 해 (공백 포함).
- 짧게: 오류가 포함된 단어나 짧은 구만 (10자 이내 권장).
- 마크다운 문법(**, *, ##, >, ---, \`\`\` 등)은 오류 아님.
- 블로그 구어체·반말 자체는 오류 아님. 맞춤법이 틀린 것만.
- 없으면 {"issues":[]} 반환.
- JSON만. 코드블록 없이.

본문:
${body}

출력: {"issues":[{"original":"잘못된 텍스트","suggestion":"올바른 텍스트","reason":"이유"}]}`;

  const msg = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
  const fenceMatch = raw.match(/```json\s*\n([\s\S]*?)\n\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : raw;
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (!match) return NextResponse.json({ issues: [] });

  try {
    const parsed = JSON.parse(match[0]) as {
      issues?: Array<{ original: string; suggestion: string; reason: string }>;
    };
    const rawIssues = parsed.issues ?? [];
    const issues: SpellIssue[] = rawIssues
      .map(iss => {
        const offset = body.indexOf(iss.original);
        if (offset === -1) {
          // original이 body에서 안 찾아지면 콘솔에 기록
          console.warn("[spellcheck] 매칭 실패:", JSON.stringify(iss.original));
        }
        return offset !== -1 ? { ...iss, offset } : null;
      })
      .filter((x): x is SpellIssue => x !== null)
      .sort((a, b) => a.offset - b.offset);
    console.log(`[spellcheck] Claude ${rawIssues.length}개 반환 → ${issues.length}개 매칭`);
    return NextResponse.json({ issues });
  } catch {
    return NextResponse.json({ issues: [] });
  }
}
