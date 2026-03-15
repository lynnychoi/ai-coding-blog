import { NextRequest, NextResponse } from "next/server";
import { getExpectedToken, AUTH_COOKIE } from "../../../../lib/auth";
import { getGitHubFile, commitToGitHub } from "../../../../lib/github";
import fs from "fs";
import path from "path";

const SCRATCH_ROOT = path.join(process.cwd(), "scratch-notes");
const IS_LOCAL = process.env.NODE_ENV === "development";

// ── 인증 헬퍼 ──────────────────────────────────────────────────────────────
async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await getExpectedToken();
  return token === expected;
}

// ── GitHub: 폴더 목록 읽기 ─────────────────────────────────────────────────
async function listFromGitHub(): Promise<{ project: string; filename: string; path: string; date: string }[]> {
  const res = await fetch(
    `https://api.github.com/repos/lynnychoi/ai-coding-blog/contents/scratch-notes?ref=main`,
    {
      headers: {
        Authorization: `token ${process.env.GH_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ai-coding-blog",
      },
      next: { revalidate: 0 },
    }
  );
  if (!res.ok) return [];

  const entries = await res.json() as { name: string; type: string }[];
  const projects = entries.filter((e) => e.type === "dir" && e.name !== "HOW-TO-WRITE.md");

  const notes: { project: string; filename: string; path: string; date: string }[] = [];

  await Promise.all(
    projects.map(async (proj) => {
      const r = await fetch(
        `https://api.github.com/repos/lynnychoi/ai-coding-blog/contents/scratch-notes/${proj.name}?ref=main`,
        {
          headers: {
            Authorization: `token ${process.env.GH_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "ai-coding-blog",
          },
          next: { revalidate: 0 },
        }
      );
      if (!r.ok) return;
      const files = await r.json() as { name: string; type: string }[];
      for (const file of files) {
        if (!file.name.endsWith(".md") || file.type !== "file") continue;
        const datePart = file.name.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
        notes.push({
          project: proj.name,
          filename: file.name,
          path: `${proj.name}/${file.name}`,
          date: datePart,
        });
      }
    })
  );

  return notes.sort((a, b) => b.filename.localeCompare(a.filename));
}

// ── 로컬: 폴더 목록 읽기 ──────────────────────────────────────────────────
function listFromLocal(): { project: string; filename: string; path: string; date: string }[] {
  const notes: { project: string; filename: string; path: string; date: string }[] = [];
  try {
    const entries = fs.readdirSync(SCRATCH_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const projectName = entry.name;
      const projectPath = path.join(SCRATCH_ROOT, projectName);
      let files: string[];
      try {
        files = fs.readdirSync(projectPath).filter((f) => f.endsWith(".md") && f !== "HOW-TO-WRITE.md");
      } catch { continue; }
      for (const file of files.sort().reverse()) {
        const datePart = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
        notes.push({ project: projectName, filename: file, path: `${projectName}/${file}`, date: datePart });
      }
    }
  } catch { /* ignore */ }
  return notes;
}

// ── GET: 목록 또는 파일 내용 ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!await isAuthed(req)) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("file");

  // 파일 내용 읽기
  if (filePath) {
    if (IS_LOCAL) {
      const resolved = path.resolve(SCRATCH_ROOT, filePath);
      try {
        const realRoot = fs.realpathSync(SCRATCH_ROOT);
        const realResolved = fs.realpathSync(resolved);
        if (!realResolved.startsWith(realRoot)) {
          return NextResponse.json({ error: "접근 불가" }, { status: 403 });
        }
        const content = fs.readFileSync(realResolved, "utf-8");
        return NextResponse.json({ content });
      } catch {
        return NextResponse.json({ error: "파일 없음" }, { status: 404 });
      }
    } else {
      const data = await getGitHubFile(`scratch-notes/${filePath}`);
      if (!data) return NextResponse.json({ error: "파일 없음" }, { status: 404 });
      return NextResponse.json({ content: data.content });
    }
  }

  // 목록 반환
  const notes = IS_LOCAL ? listFromLocal() : await listFromGitHub();
  return NextResponse.json({ notes });
}

// ── POST: 다른 프로젝트 노트를 블로그 repo에 커밋 ─────────────────────────
// 사용: POST /api/admin/scratch-notes
// body: { project: string, filename: string, content: string }
// 인증: ADMIN_SECRET 쿼리 파라미터 (다른 프로젝트에서 쿠키 없이 호출할 때)
export async function POST(req: NextRequest) {
  // 쿠키 인증 또는 secret 파라미터 인증
  const cookieOk = await isAuthed(req);
  const secretParam = new URL(req.url).searchParams.get("secret");
  const expected = await getExpectedToken();
  const secretOk = secretParam === expected;

  if (!cookieOk && !secretOk) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  let body: { project?: string; filename?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const { project, filename, content } = body;
  if (!project || !filename || !content) {
    return NextResponse.json({ error: "project, filename, content 필요" }, { status: 400 });
  }

  // 경로 검증 (슬래시, .. 금지)
  if (/[/\\]|\.\./.test(project) || /[/\\]|\.\./.test(filename)) {
    return NextResponse.json({ error: "잘못된 경로" }, { status: 400 });
  }

  const filePath = `scratch-notes/${project}/${filename}`;

  try {
    await commitToGitHub(filePath, content, `📝 scratch-note: ${project}/${filename}`);
    return NextResponse.json({ ok: true, path: filePath });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
