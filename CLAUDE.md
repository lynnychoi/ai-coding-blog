# CLAUDE.md — ai-coding-blog 프로젝트 가이드

이 파일은 Claude가 이 프로젝트에서 작업할 때 항상 참고하는 문서다.

---

## 이 블로그가 무엇인가

Lynn.ai는 단순한 AI 코딩 블로그가 아니다.
"육아 중에 처음으로 직접 만드는 사람이 되어가는 과정"을 기록하는 공간이다.
기획자/디자이너 출신의 시각으로 AI 코딩을 하면서 배운 것,
실수한 것, 고쳐나간 것을 솔직하게 쓴다.

> **핵심 철학**: 사람과 AI는 같은 실수를 반복한다. 기록하지 않으면.

- **Dev Log**: 어떻게 만들었나 (기술 기록, 시행착오)
- **Writing**: 왜 이걸 하고 있나 (삶의 맥락, 감정 기록)

이 두 섹션은 분리된 게 아니라 같은 이야기의 두 얼굴이다.

독자: 비개발자인데 AI 코딩을 시작해보고 싶은 기획자/디자이너,
육아 등 시간 제약 속에서 사이드 프로젝트를 하는 사람,
화려한 성공담이 아닌 솔직한 기록을 원하는 사람.

**Claude가 이 맥락을 활용하는 방법:**
- 기능 추가, UI 결정, 글쓰기 방향 등 모든 판단의 기준이 된다
- "이 결정이 Lynn.ai의 정체성과 어울리는가"를 먼저 묻는다
- 기술적으로 가능하더라도 이 블로그의 성격과 맞지 않으면 제안하지 않는다
- 독자가 비개발자임을 항상 염두에 둔다 — 코드보다 맥락, 결과보다 과정

---

## 프로젝트 개요

Lynn(최유경)의 개인 블로그. 기획자/디자이너 출신이 Claude Code로 AI 코딩을 배우는 과정을 기록.
Next.js + GitHub 마크다운 파일 기반. 글 관리는 `/cooking` (Cooking Station)에서.

> **중요**: 어드민 영역은 `/admin`이 아니라 `/cooking`이다. `app/admin/`은 삭제됨. 레거시 `app/write/`, `app/edit/`도 삭제됨.

---

## 참고 문서 가이드

### 언제 무엇을 읽나

| 상황 | 참고 파일 |
|------|-----------|
| 블로그 글 생성/수정 (dev 타입) | `prompts/LYNN-BLOG-PRINCIPLES.md` + `prompts/LYNN-BLOG-PRINCIPLES-DEV.md` |
| 블로그 글 생성/수정 (writing 타입) | `prompts/LYNN-BLOG-PRINCIPLES.md` + `prompts/LYNN-BLOG-PRINCIPLES-WRITING.md` |
| 글 타입 불명확할 때 | `prompts/LYNN-BLOG-PRINCIPLES.md` 먼저, 타입 확인 후 확장본 추가 |
| 글 작성 중 마크다운 컴포넌트 선택 | `prompts/LYNN-MARKDOWN-COMPONENTS.md` 읽을 것 |
| 원칙 업데이트 요청 | 기존 파일을 `prompts/archive/파일명-YYYY-MM-DD.md`로 저장 후 수정 |
| scratch-notes 작성/확인 | `scratch-notes/HOW-TO-WRITE.md` 참고 |
| git push 전 | `prompts/operations/push.md` 읽고 체크리스트 따를 것 |
| 파일/코드 수정 전 | `prompts/operations/file-verification.md` 읽을 것 |
| UI 관련 코드 수정 후 로컬 테스트 | `prompts/operations/visual-test.md` 읽고 스크린샷 찍어서 직접 확인할 것 |
| 코드 작성/수정 전 | `prompts/operations/coding-principles.md` 읽을 것 |

### 파일 설명

- **`prompts/LYNN-BLOG-PRINCIPLES.md`** — 공통 원칙. 톤, 문체, 금지사항, GIF 규칙, 포맷 가이드, 출력 형식(JSON). 블로그 글 관련 작업이면 항상 읽는다.
- **`prompts/LYNN-BLOG-PRINCIPLES-DEV.md`** — dev 타입 확장. 삽질 중심 구조, 기술 용어 처리 방식, 코드 블록 기준.
- **`prompts/LYNN-BLOG-PRINCIPLES-WRITING.md`** — writing 타입 확장. 에세이/감상 글. 더 감성적인 톤, 결론 없어도 됨, 소재별 특성.
- **`prompts/LYNN-MARKDOWN-COMPONENTS.md`** — 이 블로그 전용 마크다운 컴포넌트 가이드. def-box(`> 단어란?`), takeaway-box(`> !!`) 등 정확한 문법과 사용 기준.
- **`prompts/archive/`** — 과거 원칙 문서 보관. 참고용.
- **`prompts/operations/visual-test.md`** — Playwright 스크린샷 테스트 가이드. UI 수정 후 항상 실행.
- **`prompts/operations/coding-principles.md`** — 코드 작성 원칙. 중복 금지, 하드코딩 금지, 컴포넌트화, 자체 테스트 기준.
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

- `app/cooking/` — Cooking Station (어드민 영역). `/admin`은 삭제됨
- `app/cooking/write/page.tsx` — 새 글 쓰기 페이지
- `app/cooking/edit/[slug]/page.tsx` — 글 편집 페이지
- `app/api/write/route.ts` — 새 글 생성 API
- `app/api/admin/generate-edit/route.ts` — AI 글 수정 API (URL은 /api/admin이지만 내부용)
- `app/api/admin/posts/[slug]/route.ts` — 글 조회/저장 API (내부용)
- `content/posts/` — 마크다운 글 파일들
- `scratch-notes/` — 작업 세션 기록
- `logs/generation-log/` — 글 생성 이력

## 주의사항

- 미들웨어 파일: `middleware.ts` (이전 `proxy.ts`에서 수정됨)
- gray-matter 날짜 파싱: `instanceof Date ? .toISOString().substring(0,10) : String(data.date)`
- Giphy API는 서버사이드 프록시(`app/api/admin/giphy/route.ts`)로만 호출 — 클라이언트 노출 금지
