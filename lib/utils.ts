export function today(): string {
  return new Date().toISOString().substring(0, 10);
}

export function todayDatetime(): string {
  return new Date().toISOString().substring(0, 16);
}

export function parseClaudeJson<T>(rawText: string): T {
  // 1. 코드블록 벗기기
  let clean = rawText
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/```\s*$/m, "")
    .trim();

  // 2. 직접 파싱 시도
  try {
    return JSON.parse(clean) as T;
  } catch { /* 계속 */ }

  // 3. 첫 { 부터 마지막 } 까지 추출
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(clean.slice(start, end + 1)) as T;
  }

  throw new Error("JSON을 찾을 수 없음");
}
