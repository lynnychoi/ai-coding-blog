import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SCRATCH_ROOT = path.join(process.cwd(), "scratch-notes");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("file");

  // 파일 내용 읽기
  if (filePath) {
    // path traversal 방지
    const resolved = path.resolve(SCRATCH_ROOT, filePath);
    if (!resolved.startsWith(fs.realpathSync(SCRATCH_ROOT))) {
      return NextResponse.json({ error: "접근 불가" }, { status: 403 });
    }
    try {
      const content = fs.readFileSync(resolved, "utf-8");
      return NextResponse.json({ content });
    } catch {
      return NextResponse.json({ error: "파일 없음" }, { status: 404 });
    }
  }

  // 노트 목록 반환
  const notes: { project: string; filename: string; path: string; date: string }[] = [];

  try {
    const entries = fs.readdirSync(SCRATCH_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      if (entry.name === "HOW-TO-WRITE.md") continue;

      const projectName = entry.name;
      const projectPath = path.join(SCRATCH_ROOT, projectName);

      let files: string[];
      try {
        files = fs.readdirSync(projectPath).filter((f) => f.endsWith(".md"));
      } catch {
        continue;
      }

      for (const file of files.sort().reverse()) {
        // 파일명에서 날짜 추출 (YYYY-MM-DDTHH:MM:SS-키워드.md)
        const datePart = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
        notes.push({
          project: projectName,
          filename: file,
          path: `${projectName}/${file}`,
          date: datePart,
        });
      }
    }
  } catch {
    return NextResponse.json({ error: "scratch-notes 읽기 실패" }, { status: 500 });
  }

  return NextResponse.json({ notes });
}
