# 주말 하루에 어드민 페이지 통째로 만든 날 (합본)

> 합본 노트. 원본:
> - 2026-03-12T00:00:00-mobile-write-system.md
> - 2026-03-12T10:00:00-admin-dashboard-security.md
> - 2026-03-12T14:00:00-comprehensive-edit-page.md
> - 2026-03-12T15:00:00-write-page-redesign.md

## 프로젝트 한 줄 소개

Lynn(최유경)의 개인 블로그. 기획자/디자이너 출신이 Claude Code로 AI 코딩을 처음 배우면서, 글 쓰기·수정·관리를 전부 휴대폰으로도 할 수 있는 어드민 시스템을 만들었다. Next.js + GitHub 마크다운 파일 기반.

## 이 작업을 하게 된 이유

블로그 글 하나 쓰려면 매번 로컬에서 마크다운 파일 만들고 커밋해야 했다.
"이거 휴대폰으로도 쓸 수 있으면 어떨까?" 아이 재우고 누운 채로, 이동 중에 생각나는 거 바로 적고 싶었다. 그냥 메모 몇 줄 던지면 Claude가 블로그 글로 만들어주는 구조를 원했다.

근데 이걸 만들려면 4가지가 필요했다 — **글 쓰기 시스템 + 보안 + 대시보드 + 편집기**. 결국 하루에 이 4개를 다 만들었다.

## 뭘 했나

### 1. 모바일 글쓰기 시스템 — 뼈대 만들기

- `prompts/blog-writing-rules.md` — Claude가 글 쓸 때 지킬 룰 (GIF 필수, 톤, 용어 설명). 독자가 비개발자라 이게 제일 중요했다.
- `lib/github.ts` — GitHub Contents API 래퍼. `getGitHubFile` + `commitToGitHub` 두 함수.
- `lib/auth.ts` — 어드민 인증. HTTP-only 쿠키 + `crypto.subtle` SHA-256 (Edge와 Node 런타임 둘 다 동작해야 해서).
- `middleware.ts` — `/admin` 전체 경로를 쿠키 없으면 로그인 페이지로 리다이렉트.
- `app/api/write/route.ts` — 메모 받아서 Claude한테 보내고, 결과 마크다운을 GitHub에 커밋. 이미지도 base64로 같이 커밋.
- `/write` (공개·비밀번호 입력), `/admin/write` (쿠키 인증) 두 진입점.

### 2. 어드민 대시보드 + 보안

- `/admin` 대시보드 — dev/writing 타입별 글 목록, 각 글마다 "보기" + "수정" 링크
- `app/admin/LogoutButton.tsx` — 서버 컴포넌트(대시보드)에서 클라이언트 동작(로그아웃) 필요해서 버튼만 분리
- `app/api/posts/route.ts` — 글 목록 JSON API
- `app/api/admin/giphy/route.ts` — Giphy API를 서버사이드 프록시로. API 키 클라이언트 노출 방지.

### 3. 종합 편집 페이지 — 진짜 도구

기존 편집 페이지가 raw 마크다운 그대로 보여줘서 답답했다. 다 갈아엎음.

- `app/api/admin/posts/[slug]/route.ts` — GET: `gray-matter`로 frontmatter 분리해서 필드별 반환. PUT: 마크다운 직접 저장 (Claude 없이).
- `app/api/admin/generate-edit/route.ts` — Claude AI 수정 API. **커밋은 안 하고 수정된 마크다운만 반환.** 사용자가 확인 후 저장.
- 편집 페이지:
  - 제목·날짜·타입·태그 각각 편집할 수 있는 필드
  - 원본 메모/소스 섹션 (접기/펼치기) → 나중에 이게 블로그 재료가 됨
  - 마크다운 편집기 + 미리보기 토글
  - 하단 탭: [AI 수정] [GIF] [이미지]
  - AI 탭: 지시 입력 → Claude 수정안 → 확인 후 저장
  - GIF 탭: Giphy 검색 → 클릭하면 커서 위치에 삽입
  - 이미지 탭: 업로드 → GitHub 커밋 → 커서 위치에 삽입
  - 상단 고정 저장 버튼 (변경사항 있을 때만 활성화)

### 4. 새 글 쓰기 페이지 개선 + UI 통일

- "재료" 칸 / "Claude에게" 칸 분리 — 저장되는 것과 저장 안 되는 것을 시각적으로 다르게
- `prompt` 파라미터 추가, 출력 형식에 `notes` 필드 추가
- 마크다운 미리보기에 react-markdown 적용
- 새 글 쓰기 ↔ 편집 페이지 UI 톤 통일 (상단 바, 섹션 구분선, 보라 계열 #c4b8f8)
- `scratch-notes/` 폴더 + `HOW-TO-WRITE.md` 작성 원칙 만들기 (지금 이 노트의 원본)

## 막혔던 것들 / 삽질

- **`@/lib/` 경로 alias 오류** — Next.js 프로젝트인데 tsconfig에 `paths`/`baseUrl` 설정이 없었다. import 오류 계속 나서 다 상대경로(`../../../lib/...`)로 바꿔야 했다. 시간 꽤 날렸다.
- **`cache: "no-store"` 타입 오류** — Next.js 16의 `RequestInit` 타입에 `cache` 옵션이 없어서 제거.
- **이미지 업로드 흐름** — `File` → `arrayBuffer()` → `Buffer.from().toString("base64")` → GitHub API. 처음엔 텍스트 파일처럼 처리하다가 바이너리 깨졌다.
- **dual auth 설계** — 공개 `/write`는 비밀번호 폼, 어드민은 쿠키. 하나의 API에서 둘 다 지원하도록.
- **middleware.ts 이름 deprecated** — Next.js 16에서 `proxy.ts`로 바꾸라는 경고. 빌드는 되는데 찝찝함. 일단 미해결.
- **서버/클라이언트 컴포넌트 분리** — 대시보드는 서버, 로그아웃 버튼은 클라이언트. 처음엔 전체 클라이언트로 만들려다가 서버사이드 패칭이 안 돼서 버튼만 분리.
- **dev server lock 파일 충돌** — `next dev`가 이미 실행 중인데 또 실행. `pkill -f "next dev"` 로 해결. (이게 나중에 큰 삽질로 돌아옴.)
- **gray-matter 날짜 파싱** — YAML 날짜를 `Date` 객체로 자동 변환. string 반환하려면 `instanceof Date ? .toISOString().substring(0,10) : String(data.date)` 처리.
- **body 분리 정규식** — frontmatter 제거 + 첫 `# 제목` 줄 제거. 패턴 몇 번 틀렸다.
- **AI 수정 후 상태 동기화** — Claude가 수정한 전체 마크다운을 frontmatter/title/body로 다시 분리. 처음엔 전체를 한 state로 관리하다가 필드 분리 구조로 바꾸면서 복잡해졌다.
- **커서 위치 삽입** — `selectionStart`/`selectionEnd` + `requestAnimationFrame`로 처리. 생각보다 까다로웠다.
- **미리보기에서 GIF가 안 보임** — react-markdown이 Next.js `Image`가 아니라 `<img>`를 써서 경고. `eslint-disable`로 처리.

## 결정의 이유

- **별도 DB 없이 GitHub 커밋** — Vercel 배포가 자동으로 연결됨. 커밋 = 배포.
- **`crypto.subtle`** — Edge(middleware) + Node(API routes) 두 런타임에서 모두 동작해야 했다.
- **Giphy 서버사이드 프록시** — API 키 노출 방지.
- **대시보드 서버 컴포넌트 유지** — 글 목록을 서버에서 바로 읽어 깜빡임 없음.
- **AI 수정은 미리보기 후 저장** — 실수로 글이 망가지는 걸 막기 위해. Claude가 고친 결과가 더 이상해질 가능성을 인정.
- **frontmatter와 body 분리 state** — 메타 필드를 별도 인풋으로 편집 가능하게 하려면 어쩔 수 없었다.
- **notes 필드를 frontmatter에 저장** — 별도 DB 없이 원본 메모를 보존.
- **재료(notes) 저장 / 지시(prompt) 저장 안 함** — 재료는 사실이고 지시는 관점이다. 섞이면 나중에 구분 안 된다.
- **UI 통일** — 자주 쓰는 도구는 일관성이 중요. 버튼 위치 생각 안 해도 손이 가야 한다.

## 그때 어떤 기분이었나

처음에 "휴대폰으로 글 쓸 수 있으면 좋겠다"는 아이디어에서 출발했는데, 그게 어드민 시스템 통째로 만드는 일이 될 줄은 몰랐다.

삽질이 꽤 많았다. 특히 경로 alias 문제는 여러 파일 고치다가 지쳤다. 보안 설계가 생각보다 고민할 게 많았다 — Edge·Node 런타임이 왜 구분되는지, 왜 API 키는 서버에서만 써야 하는지. Claude가 설명해줬는데 이해는 했지만 직접 부딪히지 않으면 몰랐을 것들.

편집 페이지를 완성하고 나서 실제로 글 하나 열어봤는데 — 제목이 큰 인풋으로 뜨고, 본문이 textarea에 있고, GIF 탭에서 검색해서 클릭하니까 바로 삽입되는 거 보고. **이게 내가 원하던 거라는 느낌이 들었다.** 뭔가 진짜 도구가 생긴 것 같은 기분.

두 페이지가 통일되고 나니까 "아 이거 어드민이구나" 하는 감각이 생겼다. scratch-notes 시스템을 만든 건 메타적인 작업이었는데, "나중에 이게 블로그 글이 된다"는 생각으로 하니 기록할 동기가 됐다 (지금 이 합본 노트가 그 증거).

## 배운 것 / Takeaway

- **복잡한 인프라 없이 GitHub을 DB처럼 쓰는 구조가 의외로 잘 작동한다** — 단일 사용자 블로그에서는 충분.
- **Edge와 Node 런타임이 섞이면 라이브러리 호환성 필수 체크.**
- **상태(state) 설계를 코딩보다 먼저** — 나중에 구조 바꾸면 두 배로 힘들다.
- **"AI가 수정한다"와 "내가 저장한다"를 UX에서 분리** — 자동화를 너무 믿으면 실수가 생긴다.
- **API 키는 항상 서버에서만** — 프록시 만드는 게 귀찮아도 해야 한다.
- **"재료"와 "지시"는 다르다** — 섞이면 나중에 구분 안 된다.
- **UI 일관성은 기능 추가만큼 중요** — 헷갈리는 도구는 안 쓰게 된다.
- **기획자가 "보안"을 구현한다는 게 어색한데, 개념을 이해하고 나면 코드는 Claude가 써줘도 된다.**
- **핵심 한 줄**: 도구를 만든다는 건 내가 뭘 불편해하는지를 정확히 알아야 한다는 거다.
