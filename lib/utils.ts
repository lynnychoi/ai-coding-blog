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

  // 2. 첫 { ~ 마지막 } 추출
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.slice(start, end + 1);
  }

  // 3. 직접 파싱 시도
  try {
    return JSON.parse(clean) as T;
  } catch { /* 계속 */ }

  // 4. JSON 문자열 내 invalid escape 수정 후 재시도 (\* \_ 등)
  const fixed = clean.replace(/\\([^"\\/bfnrtu0-9])/g, "\\\\$1");
  return JSON.parse(fixed) as T;
}
