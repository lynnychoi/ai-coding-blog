import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const expected = await getExpectedToken();
    const cookie = req.cookies.get(AUTH_COOKIE)?.value;
    if (cookie !== expected) {
      return NextResponse.json({ error: "인증 실패" }, { status: 401 });
    }

    const { title, body, tags } = (await req.json()) as {
      title?: string;
      body?: string;
      tags?: string;
    };

    if (!body?.trim()) {
      return NextResponse.json({ error: "본문이 없어요." }, { status: 400 });
    }

    const tagList = (tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => `#${t}`)
      .join(" ");

    const prompt = `아래 블로그 글을 Threads(스레드) 연속 포스트로 변환해줘.

## 규칙
- 전체를 3~6개의 포스트로 나눠. 각 포스트는 반드시 500자 이내.
- 첫 포스트: 독자를 잡는 훅. 왜 읽어야 하는지, 상황 공감. 글 제목/링크 넣지 마.
- 중간 포스트: 블로그 핵심 내용 요약. 마크다운 문법(##, **, ![...]) 제거하고 일반 텍스트로.
- 마지막 포스트: 핵심 takeaway 한 줄 + 블로그 링크 자리표시자 [링크] + 해시태그.
- 톤: 솔직하고 털털하게. 꾸미지 않고 직접적으로. "~요" 체.
- GIF/이미지 마크다운은 모두 제거.
- 각 포스트 사이엔 자연스럽게 이어지게 (1/n 같은 번호 표시 불필요).

## 해시태그 (마지막 포스트에만)
${tagList || "#AI코딩 #육아 #사이드프로젝트"}

## 블로그 글 제목
${title ?? ""}

## 블로그 글 본문
${body}

JSON 형식으로만 응답해:
{"posts": ["첫번째 포스트 텍스트", "두번째 포스트 텍스트", "..."]}`;

    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "변환 실패 (응답 파싱 오류)" }, { status: 500 });
    }
    const parsed = JSON.parse(match[0]) as { posts: string[] };
    return NextResponse.json({ posts: parsed.posts });
  } catch (e) {
    return NextResponse.json({ error: `서버 오류: ${String(e)}` }, { status: 500 });
  }
}
