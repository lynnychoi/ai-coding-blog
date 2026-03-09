---
date: 2026-03-10
datetime: 2026-03-10T15:00
tags: [css, animation, design, next.js, framer-motion]
type: dev
---

# 히어로 섹션 하나 만드는 데 하루 다 썼다

오늘은 블로그 첫 화면 디자인 작업을 했다. 코드 한 줄 없이 기획서만 쓰던 사람이 CSS 애니메이션을 만지고 있으니 이게 맞나 싶었는데 — 일단 됐다.

## 오로라 블롭 애니메이션

배경에 민트, 라벤더, 하늘색 글로우가 느릿하게 떠다니는 효과를 만들었다. `div` 세 개에 `border-radius: 50%`랑 `filter: blur()`를 주고, `@keyframes`로 움직이게 하는 방식.

처음엔 픽셀 값으로 이동 거리를 줬는데, 데스크탑에서 보면 왼쪽에서만 맴도는 것처럼 보였다. `vw/vh` 단위로 바꾸니까 화면 크기에 맞게 히어로 전체를 가로질러 다니게 됐다.

```css
@keyframes floatBlob1 {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(52vw, 4vh) scale(0.75); }
  66%  { transform: translate(60vw, 20vh) scale(0.85); }
  100% { transform: translate(0, 0) scale(1); }
}
```

`animation-delay` 에 음수값을 주면 애니메이션이 이미 진행 중인 상태에서 시작한다. 세 블롭이 같은 리듬으로 움직이는 느낌을 없애는 데 이게 핵심이었다.

## 헤더 스크롤 등장

홈 화면에서 처음 들어오면 헤더가 없고 타이틀만 꽉 차 보이게 하고 싶었다. 스크롤을 내리면 헤더가 자연스럽게 나타나도록.

```tsx
const threshold = window.innerHeight * 0.6;
const check = () => setVisible(window.scrollY > threshold);
window.addEventListener("scroll", check, { passive: true });
```

모바일에서만 적용하고, 데스크탑은 처음부터 헤더 보이게 했다. `window.innerWidth >= 641` 체크.

## 히어로 full-bleed

히어로 섹션이 `max-width: 860px` 컨테이너 안에 갇혀서 블롭이 양쪽에서 잘렸다. 이걸 화면 꽉 차게 빼내는 CSS 트릭:

```css
.hero {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
```

텍스트는 안에 래퍼를 따로 두고 `max-width: 860px; margin: 0 auto`로 중앙 정렬 유지.

## 타이틀 그라데이션

"기획자가"는 민트→흰색, "직접 만들기 시작했다"는 흰색→라벤더. 짧은 텍스트에 그라데이션 먹이면 끝에서야 색이 바뀌어서 안 보이는 문제가 있었다. 중간에 경유 색을 하나 더 추가해서 해결:

```css
background: linear-gradient(90deg, var(--accent) 0%, #b0f0e0 40%, #ffffff 85%);
```

---

한 가지 배운 것: CSS 애니메이션은 값 하나 바꾸는 것만으로 느낌이 완전히 달라진다. `opacity` 0.5 vs 0.85, `blur` 55px vs 70px, duration 6s vs 16s — 이게 다 다른 분위기다. 코딩이라기보단 감각 싸움에 가까웠다.
