# 모바일 글쓰기 시스템 구축

## 프로젝트 한 줄 소개
Claude Code로 만드는 개인 블로그. 기획자/디자이너 출신인 Lynn이 AI 코딩을 처음 배우면서 겪는 실수와 교훈을 기록하는 곳. Next.js + GitHub 기반, 글은 마크다운으로 저장된다.

## 이 작업을 하게 된 이유
블로그 글을 쓰려면 매번 로컬에서 마크다운 파일 만들고 커밋해야 했다. 그러다 보니 "이거 휴대폰으로도 쓸 수 있으면 어떨까?" 라는 생각이 들었다. 아이 재우고 누운 채로, 혹은 이동 중에 생각나는 거 바로 적고 싶었다. 그냥 메모 몇 줄 던지면 Claude가 블로그 글로 만들어주는 구조를 원했다.

## 뭘 했나
- `prompts/blog-writing-rules.md` — Claude가 글 쓸 때 지켜야 할 룰 문서 작성. GIF 필수 1개 이상, 톤, 포맷 다양하게, 용어 설명 등. 독자가 개발자가 아니니까 이게 제일 중요했다.
- `lib/github.ts` — GitHub Contents API 래퍼. 파일 읽기(`getGitHubFile`)와 커밋(`commitToGitHub`) 두 함수.
- `lib/auth.ts` — 어드민 인증. HTTP-only 쿠키 기반. `crypto.subtle` SHA-256으로 토큰 생성 (Edge 런타임과 Node 런타임 둘 다 되어야 해서 이걸 선택했다).
- `middleware.ts` — `/admin` 경로 전체를 쿠키 없으면 로그인 페이지로 리다이렉트.
- `app/api/write/route.ts` — 메모 받아서 Claude한테 보내고, 결과 마크다운을 GitHub에 커밋. 이미지도 base64로 변환해서 같이 커밋.
- `/write`, `/admin/write` 페이지 — 공개용(비밀번호 입력)과 어드민용(쿠키 인증) 두 버전.

## 막혔던 것들 / 삽질
- **`@/lib/` 경로 alias 오류**: Next.js 프로젝트인데 tsconfig에 `paths`나 `baseUrl`이 설정 안 되어 있었다. 계속 import 오류가 났고 다 상대경로(`../../../lib/...`)로 바꿔야 했다. 시간 꽤 날렸다.
- **`cache: "no-store"` 타입 오류**: Next.js 16의 `RequestInit` 타입에 `cache` 옵션이 없다. 그냥 제거했다.
- **이미지 업로드 삽질**: `File` → `arrayBuffer()` → `Buffer.from().toString("base64")` → GitHub API. 이 흐름 파악하는 데 시간 걸렸다. 처음엔 텍스트 파일처럼 처리하려다 바이너리가 깨졌다.
- **dual auth 설계**: 공개 `/write` 페이지는 비밀번호 폼으로, 어드민 페이지는 쿠키로 인증해야 했다. 하나의 API에서 두 방식을 모두 지원하도록 만들었다.

## 결정의 이유
- 별도 DB 없이 GitHub에 직접 커밋하는 방식을 선택한 건, Vercel 배포와 자동으로 연결되기 때문. 커밋하면 바로 배포된다.
- `crypto.subtle` 선택: Edge 런타임(middleware)과 Node 런타임(API routes)이 공존하는데, 두 곳에서 모두 동작하는 암호화 방식이 필요했다.

## 그때 어떤 기분이었나
처음에 "휴대폰으로 글 쓸 수 있으면 좋겠다"는 아이디어에서 출발해서, 실제로 동작하는 걸 보니 신기했다. 근데 삽질이 꽤 많았다. 특히 경로 alias 문제는 여러 파일 고치다가 지쳤다. 이미지 업로드 되는 거 확인했을 때는 좀 뿌듯했음.

## 배운 것 / Takeaway
- Next.js 프로젝트 시작할 때 tsconfig `paths` 설정 먼저 확인할 것
- Edge 런타임과 Node 런타임이 섞이면 라이브러리 호환성 꼭 체크해야 함
- GitHub Contents API는 이미지든 텍스트든 base64로 올리면 다 됨
- **핵심 한 줄**: 복잡한 인프라 없이 GitHub을 DB처럼 쓰는 구조가 생각보다 잘 작동한다.
