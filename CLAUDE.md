# CLAUDE.md — ai-coding-blog 프로젝트 가이드

이 파일은 Claude가 이 프로젝트에서 작업할 때 항상 참고하는 문서다.

---

## 프로젝트 개요

Lynn(최유경)의 개인 블로그. 기획자/디자이너 출신이 Claude Code로 AI 코딩을 배우는 과정을 기록.
Next.js + GitHub 마크다운 파일 기반. 글 관리는 어드민 페이지에서.

---

## 참고 문서 가이드

### 언제 무엇을 읽나

| 상황 | 참고 파일 |
|------|-----------|
| 블로그 글 생성/수정 (dev 타입) | `prompts/LYNN-BLOG-PRINCIPLES.md` + `prompts/LYNN-BLOG-PRINCIPLES-DEV.md` |
| 블로그 글 생성/수정 (writing 타입) | `prompts/LYNN-BLOG-PRINCIPLES.md` + `prompts/LYNN-BLOG-PRINCIPLES-WRITING.md` |
| 글 타입 불명확할 때 | `prompts/LYNN-BLOG-PRINCIPLES.md` 먼저, 타입 확인 후 확장본 추가 |
| 원칙 업데이트 요청 | 기존 파일을 `prompts/archive/파일명-YYYY-MM-DD.md`로 저장 후 수정 |
| scratch-notes 작성/확인 | `scratch-notes/HOW-TO-WRITE.md` 참고 |

### 파일 설명

- **`prompts/LYNN-BLOG-PRINCIPLES.md`** — 공통 원칙. 톤, 문체, 금지사항, GIF 규칙, 포맷 가이드, 출력 형식(JSON). 블로그 글 관련 작업이면 항상 읽는다.
- **`prompts/LYNN-BLOG-PRINCIPLES-DEV.md`** — dev 타입 확장. 삽질 중심 구조, 기술 용어 처리 방식, 코드 블록 기준.
- **`prompts/LYNN-BLOG-PRINCIPLES-WRITING.md`** — writing 타입 확장. 에세이/감상 글. 더 감성적인 톤, 결론 없어도 됨, 소재별 특성.
- **`prompts/archive/`** — 과거 원칙 문서 보관. 참고용.
- **`scratch-notes/`** — 작업 세션 기록. 블로그 글의 원재료.

---

## 원칙 문서 업데이트 방법

Lynn이 원칙 추가/수정을 요청하면:
1. 현재 파일을 `prompts/archive/파일명-YYYY-MM-DD.md`로 복사
2. 원본 파일 수정
3. 파일 하단 변경 이력 테이블 업데이트

---

## 주요 기술 스택

- Next.js 16 (App Router), TypeScript
- `gray-matter` — 마크다운 frontmatter 파싱 (날짜는 `Date` 객체로 나옴 — string 변환 필요)
- `react-markdown` + `remark-gfm` — 마크다운 미리보기
- GitHub Contents API — 글 저장/불러오기 (base64 인코딩)
- HTTP-only 쿠키 인증 (`crypto.subtle` SHA-256)
- Claude API (`claude-opus-4-6`) — 글 생성/수정

## 주요 파일 경로

- `app/api/write/route.ts` — 새 글 생성 API
- `app/api/admin/generate-edit/route.ts` — AI 글 수정 API
- `app/api/admin/posts/[slug]/route.ts` — 글 조회/저장 API
- `app/admin/write/page.tsx` — 새 글 쓰기 페이지
- `app/admin/edit/[slug]/page.tsx` — 글 편집 페이지
- `content/posts/` — 마크다운 글 파일들
- `scratch-notes/` — 작업 세션 기록

## 주의사항

- `middleware.ts` 이름 deprecated (Next.js 16에서 `proxy.ts`로 바꿔야 함) — 아직 미수정
- gray-matter 날짜 파싱: `instanceof Date ? .toISOString().substring(0,10) : String(data.date)`
- Giphy API는 서버사이드 프록시(`app/api/admin/giphy/route.ts`)로만 호출 — 클라이언트 노출 금지
