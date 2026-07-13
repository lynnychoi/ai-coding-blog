# Dev Log

---

## 2026-04-10 (4)

- LYNN-BLOG-PRINCIPLES.md 글쓰기 원칙 강화:
  - 4번: 한 가닥 흐름 원칙 / 포함할 거면 깊게 빼면 과감하게 / h2-first 규칙
  - 5번: 제목이 핵심 갈등/긴장을 대표해야 한다는 원칙 + 제목 테스트 기준
  - 11번: markdown 템플릿에 ## 섹션 바로 시작하는 구조 반영
- LYNN-BLOG-PRINCIPLES-DEV.md: 동일 원칙 반영
- 아카이브: LYNN-BLOG-PRINCIPLES-2026-04-10.md

---

## 2026-04-10 (3)

- 목록 페이지 각 글 편집 버튼 제거 (hover 방식 → 레이아웃 깨짐, Cooking Station으로 충분)
- AdminListControls 단순화: 새 글 쓰기 버튼만 유지

---

## 2026-04-10 (2)

- StickyHeader: 로그인 시 nav에 🍳 아이콘으로 Cooking Station 링크 추가
- AdminBar: 플로팅 Cooking Station 버튼 제거 (nav로 통합)
- AdminListControls 신규 컴포넌트: Dev Log / Writing 리스트 페이지에서 로그인 시 새 글 쓰기 버튼 + 각 글 hover 시 편집 링크 표시

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
