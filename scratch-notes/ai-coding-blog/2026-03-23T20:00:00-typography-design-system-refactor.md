# 타이포그래피 디자인 시스템 구축 — 디자이너가 CSS 변수로 테마를 짰다

## 프로젝트 한 줄 소개
Lynn(최유경)의 개인 블로그. 기획자/디자이너 출신이 Claude Code로 처음 직접 만드는 AI 코딩 기록. 글은 두 종류 — 개발 과정을 기록하는 `dev` 타입과 에세이·감상을 쓰는 `writing` 타입.

## 이 작업을 하게 된 이유

### 문제의 시작: 일관성이 없었다
글을 올리다 보니 dev 글과 writing 글의 느낌이 달랐으면 했다. Dev 글은 기술 블로그처럼 건조하고 명료하게, writing 글은 에세이처럼 따뜻하고 여유 있게. 근데 실제로 보니 둘이 거의 똑같아 보였다.

폰트도 그냥 기본값이었고, H2에 어떤 강조가 있어야 할 것 같은데 아무것도 없었고, blockquote랑 섹션 구분이 시각적으로 구별이 안 됐다.

### "나중에 갑자기 스타일 뒤집을 수도 있어"
Lynn이 이 말을 직접 했다. "나 디자이너잖아. 갑자기 질리면 가장 쉽게 바꿀 수 있는 게 디자인이어야 해." 이 한 마디가 이번 작업의 방향을 결정했다 — 구조와 색상을 분리해서, 색상 변수 몇 개만 바꾸면 전체 테마가 바뀌는 구조를 만들기로.

## 뭘 했나 (작업 목록)

### 1. 폰트 시스템 확정
- **Dev 글**: `Figtree` (영문) + `Pretendard` (한글) → 깔끔하고 현대적
- **Writing 글**: `Hanken Grotesk` (영문) + `Gowun Dodum` (한글) → 약간 더 부드럽고 읽기 편한
- **공통 모노스페이스**: `Fira Code` — 날짜, 코드, 레이블, 태그 전부 이걸로 통일
- `app/layout.tsx`에 Google Fonts + Pretendard CDN 추가

### 2. H2 스타일 결정 — 선 방향 싸움
H2를 시각적으로 구분하고 싶었는데 처음엔 border-left(왼쪽 세로 바)였다. 근데 blockquote도 왼쪽 세로 바라서 둘이 구별이 안 됐다.

논의를 거쳐 **H2 텍스트 위에 30px 짧은 가로 선** (`::before` pseudo-element)으로 확정. 길이 옵션은 10px, 15px, 20px, 30px, 50px을 다 비교해봤고 30px이 선택됐다.

### 3. Blockquote 스타일 결정
H2랑 다르게 보여야 하니까 왼쪽 세로 1px 선만 남기기로. 여러 옵션 (인용부호 `"`, 상단 선, 점선, 양쪽 선 등)을 논의하고 가장 단순한 것으로 확정.

### 4. 링크 vs 강조 밑줄 구분
- `<a>` 링크: 회색 밑줄 (조용하게 — 외부 링크라 권장하고 싶지 않음)
- `<u>` 강조: accent 색상 밑줄 (의도적 강조)
- 이전엔 둘 다 accent 색이라 구별이 안 됐음

### 5. HR 섹션 구분선
H2 위에 짧은 선이 생기니까 HR도 짧은 선이면 둘이 비슷해 보이는 문제가 생겼다. 해결책:
- **Dev 글 HR**: `// ---` (코드 주석 스타일, Fira Code)
- **Writing 글 HR**: `· · ·` (문학적 스타일)

### 6. CSS 리팩터 — 핵심 작업
원래 `.post-body`(dev)와 `.writing-body`(writing) 두 클래스에 같은 구조 규칙이 중복으로 들어 있었다. 이걸 CSS 변수(`--article-accent`, `--article-tint` 등)로 분리해서:

```css
/* 이렇게만 바꾸면 전체 테마가 바뀐다 */
.post-body {
  --article-accent: #06d6a0;  /* mint */
}
.writing-body {
  --article-accent: #c4b5fd;  /* lavender */
}
```

119줄 추가, 171줄 삭제 — 결과적으로 52줄 줄었다.

### 7. 포스트 내용 수정
기존 글 4개에서 결론 문장이 blockquote(`>`)로 잘못 쓰여 있었다. `takeaway-box`로 수정:
- `why-i-started-coding.md`
- `first-nap-time-coding.md`
- `being-alone-with-baby.md`
- `playwright-testing-blog-creation.md`

### 8. About 페이지 연결
About 페이지는 전부 인라인 스타일로 쓰여 있었는데, outer wrapper에 `className="post-body"`를 붙여서 CSS 변수 체계에 연결했다. 지금은 눈에 띄는 변화는 없지만, 나중에 테마 바꿀 때 자동으로 따라온다.

## 막혔던 것들 / 삽질

### Git 충돌 — untracked 파일이 remote에도 있었다
작업을 커밋하고 push하려는데 local에 `content/posts/2026-03-21-playwright-testing-blog-creation.md`가 untracked 상태로 있었고, remote에도 같은 파일이 5번 수정된 상태였다. `git pull` 하면 "untracked working tree files would be overwritten" 오류가 날 수 있는 상황.

해결: local 파일을 `/tmp/`에 백업 후 삭제 → `git pull --rebase` → remote 버전으로 merge.

### `<hr>` CSS pseudo-element 불확실성
`hr::after`로 `· · ·` 넣는 방법이 브라우저마다 다르게 동작할 수 있어서 불확실했다. 실제로 해봤더니 됐지만, 이건 replaced element 관련 브라우저 구현 차이가 있어서 항상 동작한다고 보장하기 어렵다.

### H2 `::before` 선과 HR이 너무 비슷해 보이는 문제
H2 위에 30px 짧은 가로 선을 넣었더니, HR(섹션 구분선)도 짧은 가로 선이라서 둘이 구별이 안 된다는 피드백이 나왔다. HR을 `· · ·`나 `// ---`로 바꾸면서 해결.

### CSS 리팩터 중 변수 이름 충돌
기존에 `--accent-w`(writing accent)라는 변수가 writing-body에서 쓰이고 있었다. 리팩터하면서 `--article-accent`로 통일하려 했는데, `--accent-w`를 참조하는 다른 CSS도 있어서 두 변수를 병행해서 남겨야 했다. 완전한 정리는 나중에.

## 결정의 이유 (왜 이렇게 만들었나)

### "가장 쉽게 바꿀 수 있어야 한다"
CSS 변수로 색상을 분리한 핵심 이유. 디자이너 입장에서 나중에 파란색 계열로 바꾸고 싶거나, 시즌마다 테마를 바꾸고 싶을 때 한 줄만 수정하면 전체가 바뀌어야 한다.

### 두 글 타입의 "느낌"을 다르게 가져가야 한다
Dev 글은 기술 블로그 느낌이라 민트 + Figtree가 맞다. Writing 글은 에세이라 라벤더 + Hanken Grotesk가 더 부드럽다. 같은 구조 규칙(h2, blockquote, ul 등)에 색상과 폰트만 다르게 → 일관성과 차별화를 동시에.

### H2 선 길이를 고정값으로
텍스트 길이에 맞추면 글마다 선 길이가 달라져서 일관성이 없다. 30px로 고정하면 어떤 제목이 오든 동일하게 보인다.

## 그때 어떤 기분이었나 (Claude 입장에서)

솔직히 이 작업은 설계 의사결정의 연속이었다. 기능을 만드는 작업이 아니라 "이게 더 나아 보여? 저게 더 나아 보여?" 를 계속 반복하는 작업이라 **정답이 없는 질문을 계속 받는 느낌**이었다.

특히 힘들었던 건:
- **blockquote 옵션 논의**: 인용부호, 상단 선, 점선, 양쪽 선 등 여러 옵션을 HTML 미리보기 파일로 만들어 보여줬는데, "B랑 C 다 괜찮아 보여" → "C가 좋은데 점선은 어때?" → "텍스트 끝날 때 선도 끝나야 하지 않아?" → 결국 "모르겠어 어떤 게 나아?" 까지 갔다가 H2를 선 스타일로 바꾸고 blockquote는 단순 왼쪽 바로 확정. 선택지를 좁혀가는 과정이 꽤 길었다.

- **compare HTML 파일 유지**: 실제 블로그 CSS 말고 Desktop에 있는 `style-preview-compare.html`이라는 별도 레퍼런스 파일도 계속 sync를 맞춰야 했다. 블로그 CSS 바꾸고, HTML도 바꾸고, 두 곳이 동시에 최신 상태여야 했다.

- **Git 상황 정리**: 5개 commit 뒤처진 상태에서 untracked 파일 충돌 가능성을 발견하고, rebase로 정리하는 과정. 간단한 작업이지만 "100% 안전해?" 를 두 번 확인받아야 하는 상황이라 신중하게 처리해야 했다.

재밌었던 건 Lynn이 "나 디자이너니까 갑자기 스타일 뒤집을 수 있어" 라고 말했을 때다. 그 말 하나로 CSS 변수 구조로 리팩터하는 방향이 바로 결정됐다. 요구사항이 명확하면 설계가 쉬워진다.

## 배운 것 / Takeaway

- **CSS 변수는 "나중에 바꾸기 위한 것"이다** — 지금 동작하는 게 목적이 아니라 나중에 최소한의 수정으로 전체를 바꿀 수 있게 하는 구조
- **blockquote와 takeaway-box를 구분하는 기준**: blockquote는 흐름 중의 강조나 인용, takeaway-box는 글 전체의 핵심 결론. 글 쓸 때 마지막 문장이 결론이면 takeaway-box
- **디자인 결정은 "왜"가 없으면 나중에 다시 바꾸게 된다** — H2 선 길이를 30px로 고정한 이유, 링크를 회색 밑줄로 한 이유를 기록해야 나중에 "왜 이렇게 했지?" 했을 때 다시 논의하지 않아도 된다

**핵심 한 줄**: 색상 변수 하나만 바꾸면 전체 테마가 바뀌는 구조를 만들었다. 디자이너가 개발을 배우면 이런 걸 왜 하는지 이해가 된다.

---

## 스크린샷 참고
- `/Users/lynnchoi/Library/Application Support/CleanShot/media/media_RK0yRESf7l/` — H2 선과 HR 구분 문제 캡처 (H2 위 가로선과 HR 짧은 선이 너무 비슷해 보이는 문제)
- compare 파일: `/Users/lynnchoi/Desktop/style-preview-compare.html` — 최종 확정된 dev/writing 타이포그래피 레퍼런스

## 커밋 히스토리
- `Apply typography design system: unified fonts, H2 line, blockquote, links`
- `refactor: unify post-body/writing-body into shared structural rules`
- `fix: correct blockquote→takeaway-box in 4 posts + style tweaks`
- `style: align about page with design system`
