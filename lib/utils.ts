export function today(): string {
  return new Date().toISOString().substring(0, 10);
}

export function todayDatetime(): string {
  return new Date().toISOString().substring(0, 16);
}

export function parseClaudeJson<T>(rawText: string): T {
  const clean = rawText
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/```$/m, "")
    .trim();
  return JSON.parse(clean) as T;
}
