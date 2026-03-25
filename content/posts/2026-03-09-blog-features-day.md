---
title: "댓글, 태그 필터, 읽기 시간 — 하루 만에 블로그 기능 다 붙인 날"
date: 2026-03-09
datetime: 2026-03-09T10:00
tags: ["next.js", "claude-api", "vercel", "setup"]
type: dev
---

# 댓글, 태그 필터, 읽기 시간 — 하루 만에 블로그 기능 다 붙인 날

## 욕심을 부린 날

오늘은 블로그에 기능을 한꺼번에 너무 많이 붙이려다가 여러 번 삽질한 날이다.
결과적으로는 다 됐지만, 과정이 교과서처럼 매끄럽지는 않았다.

---

## 오늘 추가한 것들

- 최신 글 하이라이트 (Featured Post)
- 읽기 시간 (`글자 수 ÷ 200`)
- 태그 필터 버튼
- "요즘 하고 있는 것들" 섹션
- 글 갯수 + 태그 갯수 표시
- **댓글 기능**

마지막 댓글이 오늘의 메인 이벤트였다.

---

## 댓글 기능 — 계획대로 된 게 하나도 없었다

처음 계획은 **Vercel KV** (Redis 기반 무료 DB) 사용이었다.
Supabase 없이도 되냐고 물어봤고, Claude가 "된다! Vercel KV 쓰면 돼" 했다.

코드도 다 짰다. API 라우트도 만들었다. 근데 문제가 생겼다.

![이 상황](https://media.giphy.com/media/3jbR27OLT5YJv0ewvN/giphy.gif)

**Vercel KV는 CLI로 생성이 안 된다.**

대시보드에서 직접 만들어야 하는 구조인데, API 엔드포인트를 아무리 찾아봐도 없었다.
`v1/storage/kv`, `v1/kv`, `v1/databases/kv`... 다 404.

```bash
# 이런 거 다 시도했다
curl -X POST "https://api.vercel.com/v1/storage/kv"
# → 404 Not Found

curl -X POST "https://api.vercel.com/v9/stores"
# → 404 Not Found
```

Claude가 여러 방향으로 시도하다가 결국 인정했다: *"Vercel KV API가 공개되어 있지 않아."*

---

## 피벗: GitHub Issues를 DB로 쓴다

이미 GitHub 저장소가 있으니까, **GitHub Issues를 댓글 저장소로 쓰는 방식**으로 교체했다.

구조는 이렇다:

1. 포스트 슬러그마다 GitHub Issue 하나 생성
2. 댓글 하나 = Issue Comment 하나
3. 내용은 `<!-- name: 닉네임 -->\n댓글 내용` 형식으로 숨겨서 저장
4. API 라우트에서 파싱해서 블로그에 렌더링

```typescript
// 댓글 형식
`<!-- name: ${name} -->\n${content}`

// 파싱
const match = body.match(/^<!-- name: (.+?) -->\n([\s\S]+)$/);
```

GitHub API는 바로 됐다.

![됐다!](https://media.giphy.com/media/dIxkmtCuuBQuM9Ux1E/giphy.gif)

---

## API 키 첫 발급

오늘 Anthropic API 키를 처음 발급받았다.

[console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.
`sk-ant-...` 로 시작하는 긴 문자열이 나온다.

> **중요:** 키는 생성 직후에만 전체가 보인다. 복사 안 하면 다시 못 본다.

이걸 `.env.local`에 넣었다.

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_SECRET=내가_정한_비밀번호
GH_TOKEN=github_토큰
```

그리고 `.env.local`은 `.gitignore`에 들어가 있어서 GitHub에 절대 안 올라간다.
(이걸 모르고 올렸다가는 키가 노출되는 대참사가 난다)

---

## Vercel 환경변수 설정

로컬에서는 `.env.local`이 있으면 되는데,
배포된 Vercel에서는 별도로 등록해야 한다.

```bash
echo "키값" | npx vercel env add ANTHROPIC_API_KEY production
echo "비밀번호" | npx vercel env add ADMIN_SECRET production
echo "gh토큰" | npx vercel env add GH_TOKEN production
```

CLI로 바로 된다. 이건 쉬웠다.

---

## Vercel 로그인 요구 문제

배포하고 나서 다른 기기에서 접속해봤더니 **Vercel 로그인 화면**이 떴다.

공개 블로그인데 왜 로그인을 요구하지?

원인: `ssoProtection` 설정이 켜져 있었다.
Vercel 팀 계정에서 생성하면 기본으로 켜지는 보안 설정인데,
개인 공개 블로그에는 당연히 꺼야 한다.

```bash
# we don't do that here
curl -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"ssoProtection": null}' \
  "https://api.vercel.com/v9/projects/$PROJECT_ID"
```

![We don't do that here](https://media.giphy.com/media/QvYCnaFvnoJHOqtoDf/giphy.gif)

---

## 버튼 하나 만들다가 에러 터진 것

태그 필터 버튼을 만들다가 이런 에러가 났다.

```
Error: Event handlers cannot be passed to Client Component props.
```

처음에 무슨 말인지 전혀 몰랐다.

> **서버 컴포넌트 vs 클라이언트 컴포넌트?** Next.js에는 두 종류의 화면 조각이 있다. 서버 컴포넌트는 서버에서 미리 만들어서 보내주는 것 (빠르고 SEO에 좋음), 클라이언트 컴포넌트는 사용자 브라우저에서 실시간으로 동작하는 것 (버튼 클릭, 필터 같은 인터랙션 처리). 버튼 클릭 같은 "사용자 동작에 반응하는 것"은 클라이언트 컴포넌트에서만 된다.

즉, 내가 서버 컴포넌트에다 버튼 클릭 이벤트를 달려고 했던 것. 이건 안 된다.

해결책: 버튼이 있는 부분만 따로 클라이언트 컴포넌트로 분리했다. 파일 맨 위에 `"use client"` 한 줄 추가하면 클라이언트 컴포넌트가 된다.

```
app/
  page.tsx          → 서버 컴포넌트 (글 목록 데이터 가져오기)
  components/
    PostList.tsx    → 클라이언트 컴포넌트 (태그 필터 버튼 동작)
    Comments.tsx    → 클라이언트 컴포넌트 (댓글 입력 동작)
```

이 구조가 Next.js에서 자주 쓰는 패턴이라고 한다. 처음엔 왜 이렇게 복잡한지 몰랐는데, 성능 때문이라는 걸 나중에 알았다.

---

## 오늘의 레슨런

| 배운 것 | 한 줄 요약 |
|--------|----------|
| Vercel KV | CLI 생성 불가, 대시보드 필요 |
| GitHub Issues as DB | 의외로 잘 됨. 무료, 추가 설정 없음 |
| `.env.local` | `.gitignore` 필수. 커밋하면 끝남 |
| Server/Client Component | 이벤트 핸들러 = 무조건 클라이언트 |
| ssoProtection | 공개 블로그면 꺼야 함 |
| API 키 발급 | 생성 직후에만 전체 확인 가능 |

---

## 그래서 지금 블로그 상태는

배포 완료, 댓글 작동, 태그 필터 작동, 읽기 시간 표시.

다음엔 UI를 갈아엎을 예정이다.
지금 디자인이 너무 "AI가 만든 개발 블로그" 느낌이 강해서.
rauno.me랑 Linear 보면서 방향 잡았다.

![완료](https://media.giphy.com/media/mIZ9rPeMKefm0/giphy.gif)

일단 오늘 여기까지.
