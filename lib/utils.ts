export function today(): string {
  return new Date().toISOString().substring(0, 10);
}

export function todayDatetime(): string {
  return new Date().toISOString().substring(0, 16);
}

export function parseClaudeJson<T>(rawText: string): T {
  let clean: string;

  // 1. ```json 코드블록이면 실제 개행(\n)으로 경계를 찾아 추출
  //    (JSON 문자열 내 \n 이스케이프와 혼동 없음)
  const fenceMatch = rawText.match(/```json\s*\n([\s\S]*?)\n\s*```/);
  if (fenceMatch) {
    clean = fenceMatch[1].trim();
  } else {
    // 2. 코드블록이 아니면 { ~ } 추출
    clean = rawText.trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      clean = clean.slice(start, end + 1);
    }
  }

  // 3. 직접 파싱 시도
  try {
    return JSON.parse(clean) as T;
  } catch { /* 계속 */ }

  // 4. JSON 문자열 내 invalid escape 수정 후 재시도 (\* \_ 등)
  const fixed = clean.replace(/\\([^"\\/bfnrtu0-9])/g, "\\\\$1");
  return JSON.parse(fixed) as T;
}
