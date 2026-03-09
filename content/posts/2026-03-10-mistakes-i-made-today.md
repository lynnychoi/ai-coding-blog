---
date: 2026-03-10
tags: [실수, css, debug, next.js, 배운것]
type: dev
---

# 오늘 내가 한 실수들 (그리고 어떻게 고쳤는지)

오늘 히어로 섹션 하나 만들면서 예상보다 훨씬 많은 걸 고쳤다. 잘 된 것보다 안 된 것들이 더 많이 쌓였는데, 그게 사실 더 남는 게 많다는 걸 알아서 — 기록해둔다.

---

## 1. 포트 충돌: 로컬터널이 틀린 포트를 보고 있었다

Next.js를 켰더니 3000번 포트가 이미 사용 중이라며 자동으로 3002로 올라갔다. 그 상태에서 localtunnel을 3000번으로 연결했으니 모바일에서 아무것도 안 보이는 게 당연했다.

> 삽질 시간: 꽤 됨. 이유도 모르고 한참 다른 곳 뒤짐.

**고친 방법:** 프로세스 전부 죽이고 처음부터 다시 시작. `lsof -ti:3000 | xargs kill -9`

**배운 것:** 모바일에서 안 보이기 시작하면 포트부터 확인해.

---

## 2. 오로라 블롭이 모바일에서 안 보였다

분명 데스크탑에서는 보이는데 모바일에서는 블롭이 없었다. 이유는 간단했다. 히어로 섹션이 `max-width: 860px` 컨테이너 안에 갇혀 있어서 블롭이 양쪽에서 잘리고 있었던 것.

**고친 방법:** CSS full-bleed 트릭.

```css
.hero {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
```

텍스트 내용은 별도 래퍼로 다시 중앙 정렬 유지:

```css
.hero-content-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

**배운 것:** 컨테이너 안에 있는 요소를 full-bleed로 빼려면 이 패턴. 기억해둘 것.

---

## 3. 그라데이션 흰색이 "기획자가"에서 안 보였다

`기획자가`는 짧은 단어인데, 그라데이션이 `linear-gradient(90deg, mint 0%, white 100%)`이면 흰색은 오른쪽 끝에서야 등장한다. 짧은 텍스트라 흰색 부분이 거의 안 보임.

**고친 방법:** 중간 경유 색을 하나 더 추가해서 흰색이 더 일찍 나타나게:

```css
background: linear-gradient(90deg, var(--accent) 0%, #b0f0e0 40%, #ffffff 85%);
```

**배운 것:** 짧은 텍스트에 그라데이션 쓸 때는 퍼센트 값을 조정하거나 중간 색을 추가해야 한다. 긴 텍스트 기준으로 만들면 짧은 텍스트에서 색이 제대로 안 보임.

---

## 4. 페이지 이동할 때 스크롤 위치가 이상한 곳에 있었다

다른 페이지에서 홈으로 돌아오면 스크롤이 중간쯤에 걸려 있었다. Next.js App Router가 스크롤 위치를 자동으로 리셋해주지 않는 경우가 있어서 생기는 문제.

**고친 방법:** `ScrollTop` 컴포넌트 하나 만들어서 layout에 박아둠.

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollTop() {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
```

**배운 것:** Next.js에서 라우트 변경 시 스크롤 초기화는 자동이 아닐 수 있다. 명시적으로 처리해야 할 때가 있음.

---

## 5. 블롭이 왼쪽에서만 맴돌았다

블롭 이동 거리를 픽셀로 줬더니 화면이 넓을수록 블롭이 왼쪽 영역에서만 왔다갔다 했다. 화면 크기와 무관하게 고정된 픽셀이라 넓은 화면에서는 한쪽 구석에서만 움직이는 것처럼 보임.

**고친 방법:** 이동 거리를 `vw/vh` 단위로 교체.

```css
@keyframes floatBlob1 {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(52vw, 4vh) scale(0.75); }
  66%  { transform: translate(60vw, 20vh) scale(0.85); }
  100% { transform: translate(0, 0) scale(1); }
}
```

`animation-delay`에 음수값 줘서 블롭들이 각자 다른 타이밍에 시작하게 함. 같이 리듬 맞춰 움직이면 규칙적으로 보임.

**배운 것:** 화면 크기에 반응해야 하는 애니메이션은 픽셀보다 `vw/vh` 단위가 맞다.

---

## 6. 모바일 히어로가 브라우저 주소창 때문에 잘렸다

모바일에서 `height: 100vh`를 주면 브라우저 주소창 높이까지 포함돼서 실제로는 화면이 잘려 보인다.

**고친 방법:** `min-height: 100svh` 사용. `svh`는 small viewport height로, 주소창이 있는 상태의 실제 화면 높이를 기준으로 함.

**배운 것:** 모바일 풀스크린에는 `vh` 말고 `svh`. iOS Safari 대응에 필수.

---

## 오늘의 총평

CSS 한 줄 바꾸는 게 왜 이렇게 오래 걸리냐고 생각할 수도 있는데 — 사실 시간이 오래 걸린 건 코드가 아니라 *왜 안 되는지 찾는 것* 이었다.

포트 확인, 컨테이너 구조 파악, 단위 개념 이해.

Claude Code가 코드는 써줬지만 "왜 이게 안 보이지?"는 같이 생각해야 했다. 그 과정이 생각보다 재밌었다는 게 — 나도 좀 의외였다.
