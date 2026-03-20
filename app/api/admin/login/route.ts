import { NextRequest, NextResponse } from "next/server";
import { computeToken, AUTH_COOKIE, COOKIE_OPTIONS } from "../../../../lib/auth";
import { getGitHubFile, commitToGitHub } from "../../../../lib/github";

// In-memory rate limiting (resets on cold start / redeploy)
const attempts = new Map<string, { count: number; since: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 2 * 60 * 1000; // 2분

function maskPassword(pw: string): string {
  if (!pw) return "(빈 값)";
  if (pw.length <= 2) return "*".repeat(pw.length);
  if (pw.length <= 4) return pw[0] + "*".repeat(pw.length - 2) + pw[pw.length - 1];
  return pw.slice(0, 2) + "*".repeat(pw.length - 3) + pw[pw.length - 1];
}

async function logAttempt(ip: string, userAgent: string, password: string) {
  const logPath = "logs/login-attempts.md";
  const timestamp = new Date().toISOString();
  const masked = maskPassword(password);
  const ua = userAgent.substring(0, 100);

  const newRow = `| ${timestamp} | ${ip} | \`${masked}\` | ${ua} |\n`;

  const existing = await getGitHubFile(logPath);
  const header = "# 로그인 시도 기록\n\n| 시각 | IP | 입력값 | User-Agent |\n|------|----|---------|-----------|\n";
  const content = existing ? existing.content + newRow : header + newRow;

  await commitToGitHub(logPath, content, `🔐 failed login attempt from ${ip}`);
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const record = attempts.get(ip);

  if (record && record.count >= MAX_ATTEMPTS && now - record.since < LOCKOUT_MS) {
    const remainingMs = LOCKOUT_MS - (now - record.since);
    return NextResponse.json({ locked: true, remainingMs });
  }

  return NextResponse.json({ locked: false });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  // Rate limit check
  const now = Date.now();
  const record = attempts.get(ip);

  if (record) {
    if (now - record.since < LOCKOUT_MS && record.count >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_MS - (now - record.since)) / 60000);
      return NextResponse.json({ error: `${remaining}분 후에 다시 시도해줘` }, { status: 429 });
    }
    if (now - record.since >= LOCKOUT_MS) {
      attempts.delete(ip);
    }
  }

  const { password } = await req.json();

  const inputToken = await computeToken(password || "");
  const expectedToken = await computeToken(process.env.ADMIN_SECRET || "");

  if (inputToken !== expectedToken) {
    // 실패 카운트 증가
    const current = attempts.get(ip);
    if (current && now - current.since < LOCKOUT_MS) {
      current.count++;
    } else {
      attempts.set(ip, { count: 1, since: now });
    }

    // 로그 기록 (fire and forget — 로그인 속도에 영향 없게)
    logAttempt(ip, userAgent, password || "").catch(() => {});

    const remaining = MAX_ATTEMPTS - (attempts.get(ip)?.count ?? 1);
    const msg = remaining > 0
      ? `비밀번호 틀렸어 (${remaining}번 남음)`
      : "비밀번호 틀렸어";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  // 성공 — rate limit 초기화
  attempts.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, expectedToken, COOKIE_OPTIONS);
  return response;
}
