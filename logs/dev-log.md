# Dev Log

---

## 2026-04-10

- scratch-note 미리보기 기능 추가 (클릭 시 내용 확인 후 불러오기)
- 글 생성 타임아웃 문제 수정: Giphy 자동 삽입 제거 (Vercel 60s 제한 충돌)
- 글 생성 API 전체 try-catch 추가 → 빈 응답 대신 에러 메시지 표시
- 로그 파일 쓰기 try-catch 처리 (Vercel 읽기전용 파일시스템 대응)
- max_tokens 8192 → 4096 축소 (속도 개선)
- write 페이지 기본 공개여부: published → unpublished
- frontmatter 템플릿에 status 필드 추가 (없어서 항상 공개로 올라가던 버그 수정)
- 날짜 입력 필드 추가 (오늘 날짜 기본값, 직접 수정 가능)
- scratch-note 불러오기 시 해당 노트 날짜 자동 반영

---

## 2026-03-08

Today:

- Project scaffolding setup
- Defined folder structure: logs, content, scripts, app, lib
- Planned automation flow: dev-log → blog post + tweet + summary

Notes:

- Using Claude API for content generation
- Scripts: generatePost.ts, generateTweet.ts
- Stack: Next.js, Tailwind, Supabase, Vercel

---
