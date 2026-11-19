import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const expected = await getExpectedToken();
  if (req.cookies.get(AUTH_COOKIE)?.value !== expected) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { text } = await req.json() as { text: string };
  if (!text?.trim()) return NextResponse.json({ error: "내용 없음" }, { status: 400 });

  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "THREADS_ACCESS_TOKEN 설정 필요" }, { status: 500 });

  // Step 1: 미디어 컨테이너 생성
  const createUrl = new URL("https://graph.threads.net/v1.0/me/threads");
  createUrl.searchParams.set("media_type", "TEXT");
  createUrl.searchParams.set("text", text);
  createUrl.searchParams.set("access_token", token);

  const createRes = await fetch(createUrl.toString(), { method: "POST" });
  const createData = await createRes.json() as { id?: string; error?: { message: string } };

  if (!createData.id) {
    return NextResponse.json(
      { error: createData.error?.message ?? "컨테이너 생성 실패" },
      { status: 500 }
    );
  }

  // Step 2: 발행
  const publishUrl = new URL("https://graph.threads.net/v1.0/me/threads_publish");
  publishUrl.searchParams.set("creation_id", createData.id);
  publishUrl.searchParams.set("access_token", token);

  const publishRes = await fetch(publishUrl.toString(), { method: "POST" });
  const publishData = await publishRes.json() as { id?: string; error?: { message: string } };

  if (!publishData.id) {
    return NextResponse.json(
      { error: publishData.error?.message ?? "발행 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: publishData.id });
}
