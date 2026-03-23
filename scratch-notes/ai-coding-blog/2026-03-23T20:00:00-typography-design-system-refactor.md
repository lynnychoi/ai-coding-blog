# 타이포그래피 디자인 시스템 구축 — 디자이너가 CSS를 다 뜯어고쳤다

## 프로젝트 한 줄 소개
Lynn(최유경)의 개인 블로그. 기획자/디자이너 출신이 Claude Code로 처음 직접 만드는 AI 코딩 기록. 글은 두 종류 — 개발 과정을 기록하는 `dev` 타입과 에세이·감상을 쓰는 `writing` 타입.

## 이 작업을 하게 된 이유

글을 올리기 시작하니까 보이는 것들이 생겼다. 폰트가 뭔가 어색하고, H2가 두 글 타입에서 다르게 생겼고, blockquote랑 H2가 비슷해 보이고, 섹션 구분이 모호하고. 기능은 다 만들어놨는데 막상 읽히는 느낌이 영 아닌 것.

"나 디자이너잖아. 갑자기 질리면 가장 쉽게 바꿀 수 있는 게 디자인이어야 해." 이 한 마디가 이번 작업의 방향을 결정했다.

작업은 크게 네 가지였다.

---

## 1. 통일성 맞추기

### H2가 dev랑 writing에서 다르게 생겼다
가장 먼저 발견한 문제. `.post-body h2`(dev 글)는 `border-bottom`이었고, `.writing-body h2`(writing 글)는 `border-left`였다. 같은 블로그인데 글 타입에 따라 H2 스타일이 완전히 달랐다. "H2가 완전 다른데 이걸 개선해야 함."

### 영어와 한글의 베이스라인
폰트를 고를 때 영어 폰트와 한글 폰트의 베이스라인이 안 맞는 문제가 있었다. 브라우저는 영어 자리엔 영어 폰트, 한글 자리엔 한글 폰트를 자동으로 쓰는데 — 둘의 높이 기준이 다르면 한 줄 안에서 글자 높낮이가 어긋난다. `font-family: 'Figtree', 'Pretendard', sans-serif` 처럼 영어 폰트를 앞에, 한글 폰트를 뒤에 두는 방식으로 해결. 브라우저가 문자 종류에 따라 알아서 골라 쓴다.

### 두 글 타입 CSS 트리가 따로 있었다
`.post-body`와 `.writing-body`에 같은 구조 규칙(H2, H3, blockquote, ul, 링크 등)이 각각 중복으로 들어 있었다. 한쪽에서 스타일을 바꾸면 다른 쪽도 직접 찾아서 바꿔야 하는 구조. 나중에 한 번에 바꾸기로 하고 일단 두 개 따로 맞추는 작업부터 시작했다.

### `def-box`가 accent 색상을 하드코딩하고 있었다
용어 설명에 쓰는 `.def-box::before { content: "// "; color: var(--accent); }` — dev 글에선 민트, writing 글에선 라벤더여야 하는데 항상 민트로만 나왔다. CSS 변수 구조 확립 후 `var(--article-accent)`로 통일.

### 태그 필터 버튼에 Inter 폰트가 박혀 있었다
`.tag-filter-btn`에 `font-family: 'Inter'`가 하드코딩돼 있었다. Inter는 이 프로젝트에서 안 쓰는 폰트인데 어딘가에서 붙여넣기 하면서 들어온 것. 발견하고 바로 제거.

---

## 2. 예쁘게 만들기 — 결정하는 게 제일 힘들었다

### 폰트 페어링 확정
처음엔 그냥 시스템 폰트였다가, 구글 폰트를 탐색하면서 결정했다.

- **Dev 글**: `Figtree` (영문) + `Pretendard` (한글)
  → Figtree는 모던하고 약간 기술적인 느낌. Pretendard는 한글 폰트 중 가장 깔끔하고 개발 문서 느낌에 가까워서.
- **Writing 글**: `Hanken Grotesk` (영문) + `Gowun Dodum` (한글)
  → Hanken Grotesk는 Figtree보다 살짝 더 부드럽고 인간적인 느낌. Gowun Dodum은 손글씨 느낌이 살짝 있어서 에세이에 어울림.
- **공통 모노스페이스**: `Fira Code`
  → 날짜, 인라인 코드, 섹션 레이블, 태그 전부 이걸로 통일. "기술적인 것들은 다 Fira Code"라는 규칙.

### H2 스타일 확정 — 옵션 논의가 길었다
H2에 어떤 시각적 강조를 넣을지 여러 방향을 봤다.

처음엔 border-left (왼쪽 세로 바)였는데, blockquote도 왼쪽 세로 바라서 둘이 너무 비슷해 보였다. 그래서 H2는 **텍스트 위에 짧은 가로 선**으로 방향을 바꿨다. `::before` pseudo-element로 텍스트 위에 선을 그리는 방식.

선 길이 옵션:
- 10px → 너무 작다
- 15, 20, 30, 50px 비교

"글 중간중간에 있다면 다 괜찮아 보이긴 해" → "추천해줘" → **30px 확정**. 충분히 눈에 띄면서 텍스트 너비를 압도하지 않는 길이.

H2 아래 여백(bottom margin)도 작업 중에 2배로 늘렸다 (0.75rem → 1.5rem). H2 위에 선이 생기니까 텍스트와의 간격이 더 필요했다.

### Blockquote 스타일 확정 — 제일 오래 걸린 결정
H2랑 다르게 보여야 한다는 조건 하나 때문에 엄청 많은 옵션을 봤다.

논의했던 옵션들:
- 인용부호 `"` → "너무 별로"
- 상단 가로 선 + 하단 가로 선 (B안)
- 상단 점선 + 하단 점선 (C안 → 점선이 텍스트 끝이 아니라 화면 오른쪽 끝까지 늘어나서 이상함)
- 왼쪽 선만 (가장 단순)

"H2를 B처럼 바꾸고 blockquote는 C이지만 점선 아닌 걸로" → "blockquote는 왼쪽에만 선, 오른쪽 선은 없애줘" → **왼쪽 1px solid 선으로 확정**.

H2가 위에 가로선, blockquote가 왼쪽에 세로선 → 방향이 달라서 이제 구별됨.

### 링크와 강조 밑줄 구분
원래 링크(`<a>`)에 accent 색 밑줄이 있었는데, 너무 튀어 보였다. 더 근본적인 이유도 있었다 — "이 링크들은 보통 외부 링크라서 권장하고 싶은 이동 경로가 아니야."

결론:
- `<a>` 링크: 회색 밑줄 (`var(--text-3)`) → 조용하게 "이건 링크야"만 표시
- `<u>` 강조: accent 색 밑줄 → 의도적으로 강조하고 싶을 때만

hover 시 색상도 바뀌는 방식(`text-decoration-color` transition).

### HR 섹션 구분선
H2 위에 짧은 가로 선을 넣고 나서 HR도 짧은 선이면 둘이 너무 비슷해 보인다는 문제가 생겼다. 그래서 HR은 아예 선이 아닌 텍스트 기호로 바꿨다:

- **Dev 글 HR**: `// ---` (Fira Code 폰트) → 코드 주석 스타일
- **Writing 글 HR**: `· · ·` → 문학/에세이 스타일

`hr::after`로 구현. 브라우저마다 다르게 동작할 수 있다는 불확실성이 있었는데 실제로 됐다.

---

## 3. 구조적으로 읽기 쉬운 타이포그래피

### 두 글 타입의 본문 차이
같은 글인데도 읽히는 밀도가 달라야 했다.

- **Dev 글 본문**: `font-size: 0.93rem`, `line-height: 1.85` → 빠르게 읽히는 밀도
- **Writing 글 본문**: `font-size: 0.96rem`, `line-height: 2.0` → 여유 있게 읽히는 밀도

폰트 크기 차이는 0.03rem이지만 줄간격 차이(1.85 vs 2.0)가 읽는 느낌을 꽤 다르게 만든다.

### Writing 글 H1 — 그라데이션
Writing 글 제목은 plain white가 아니라 하늘색→라벤더 그라데이션으로. Dev 글 제목은 plain white. 같은 H1이지만 타입에 따라 다른 분위기.

### Writing 글 이미지 — 살짝 기울어진 스타일
Writing 글의 이미지는 `transform: rotate(-0.8deg)`로 살짝 기울어지고, `box-shadow`가 있다. Dev 글 이미지는 반듯하고 border만 있는 스타일. 작은 차이지만 글의 톤이 달라진다.

### Takeaway-box와 Blockquote의 역할 구분

이건 CSS 문제가 아니라 "언제 어느 걸 쓰느냐" 기준을 잡는 문제였다.
- **Takeaway-box**: 글 전체의 핵심 결론. 독자가 가져갈 메시지 한 줄. 글 당 1개.
- **Blockquote**: 흐름 중 강조, 인용구, 용어 설명. 결론이 아닌 것.

기존 글 8개를 전부 확인했더니 4개에서 결론 문장이 blockquote(`>`)로 잘못 쓰여 있었다. 마크다운 `>` 문법으로 쓴 것들을 `<div class="takeaway-box">`로 수정.

---

## 4. 관리 편하게 — CSS 리팩터

### 왜 리팩터가 필요했나
`.post-body`와 `.writing-body` 두 클래스에 같은 규칙이 중복으로 들어 있었다. H2 스타일 바꾸려면 두 곳을 찾아서 각각 수정해야 하는 구조. 나중에 무조건 까먹고 하나만 바꾸게 된다.

### CSS 변수로 분리
`--article-accent`, `--article-accent-dim`, `--article-tint`, `--article-strong`, `--article-em` 변수를 각 클래스에 선언하고, 구조 규칙은 `.post-body, .writing-body` 공유 셀렉터로 통합.

```css
/* 색상 변수만 바꾸면 전체 테마가 바뀐다 */
.post-body  { --article-accent: #06d6a0; }  /* mint */
.writing-body { --article-accent: #c4b5fd; }  /* lavender */

/* 구조 규칙은 한 곳에만 */
.post-body h2::before,
.writing-body h2::before {
  background: var(--article-accent);  /* 각자 색으로 자동 적용 */
}
```

결과: 119줄 추가, 171줄 삭제. 코드가 52줄 줄었다.

### 나중에 테마 바꾸려면
새 클래스에 `--article-accent` 등 변수만 선언하면 H2 선, blockquote 바, ul 불릿, 링크 강조, takeaway 배경 등 전부 자동으로 따라온다. 색상 몇 줄이 전체 테마를 제어하는 구조.

### About 페이지도 연결
About 페이지는 전부 인라인 스타일로 쓰여 있었다. blockquote 색상이 `rgba(6, 214, 160, 0.45)`로 하드코딩돼 있어서, 나중에 accent 색을 바꿔도 about 페이지는 안 따라오는 상태였다. Outer wrapper에 `className="post-body"` 추가하고 blockquote 인라인 스타일 제거 → CSS 변수 체계에 연결.

### Desktop에 레퍼런스 파일을 따로 뒀다
`/Users/lynnchoi/Desktop/style-preview-compare.html` — 실제 블로그 CSS랑 별도로, 디자인 결정을 미리 보고 확인하기 위한 HTML 파일. Dev와 Writing 두 컬럼을 나란히 놓고 같은 요소(h1, h2, h3, blockquote, takeaway-box, ul, ol, code 등)가 각 타입에서 어떻게 보이는지 한 눈에 비교할 수 있다. CSS 바꾸기 전에 이 파일에서 먼저 확인하고 적용하는 방식으로 진행했다.

---

## Git 삽질

작업을 커밋하고 push하려는데 local에 `content/posts/2026-03-21-playwright-testing-blog-creation.md`가 untracked 상태로 있었고, remote에도 같은 파일이 5번 수정된 상태였다. `git pull` 하면 "untracked working tree files would be overwritten by merge" 오류가 날 수 있는 상황.

해결: local 파일을 `/tmp/`에 백업 후 삭제 → `git pull --rebase` → remote 버전으로 merge. Local이 5 commit 뒤처진 상태에서 내 커밋을 그 위에 rebase하는 방식.

---

## 그때 어떤 기분이었나 (Claude 입장에서)

이 작업은 기능 개발이 아니라 **취향 결정의 연속**이었다. 정답이 없는 질문을 계속 받는 느낌.

제일 힘들었던 건 **blockquote 옵션 논의**였다. 인용부호, 상단+하단 선, 점선, 양쪽 선, 왼쪽 선만 등 여러 방향을 HTML 파일로 만들어 보여줬는데 "B랑 C 다 괜찮아 보여" → "C가 좋은데 양옆 점선 어때?" → "텍스트 끝날 때 선도 끝나야 하지 않아?" → "모르겠어 어떤 게 나아?" 까지 갔다. 결국 H2를 위 가로선으로 바꾸면서 blockquote는 왼쪽 세로선으로 확정됐는데, 이 결론이 나오기까지 꽤 많은 옵션을 거쳤다.

**두 파일 sync 유지**도 번거로웠다. 실제 블로그 CSS를 바꾸면서 동시에 Desktop의 compare HTML 파일도 업데이트해야 했다. 한 곳만 바꾸면 레퍼런스랑 실제가 달라지니까.

**"100% 안전해?"** 를 두 번 물어보는 상황이 있었다. Git 상태가 복잡해서 신중하게 처리해야 했는데, 확인 과정이 길어졌다.

재밌었던 건 Lynn이 "나 디자이너니까 갑자기 스타일 뒤집을 수 있어" 라고 말했을 때다. 그 말 하나로 CSS 변수 구조로 리팩터하는 방향이 즉시 결정됐다. 요구사항이 명확하면 설계가 빠르다.

---

## 배운 것 / Takeaway

- **CSS 변수는 "나중에 바꾸기 위한 것"** — 지금 동작하는 것이 목적이 아니라, 나중에 최소한의 수정으로 전체를 바꿀 수 있게 하는 구조
- **영어+한글 폰트 페어링은 순서가 중요하다** — 영어 폰트를 앞에, 한글 폰트를 뒤에. 브라우저가 문자 종류에 따라 자동으로 선택
- **blockquote vs takeaway-box 기준**: blockquote는 흐름 중 강조, takeaway-box는 글 전체의 핵심 결론. 마지막 문장이 결론이면 takeaway-box
- **디자인 결정은 "왜"가 없으면 나중에 다시 뒤집게 된다** — H2 선 30px, 링크 회색 밑줄, HR 기호 스타일 — 이유가 있어야 나중에 흔들리지 않는다

**핵심 한 줄**: 색상 변수 하나만 바꾸면 전체 테마가 바뀌는 구조를 만들었다. 디자이너가 개발을 배우면 이런 걸 왜 하는지 이해가 된다.

---

## 스크린샷 참고
- `/Users/lynnchoi/Library/Application Support/CleanShot/media/media_RK0yRESf7l/CleanShot 2026-03-23 at 19.44.04@2x.png` — H2 위 짧은 선과 HR 짧은 선이 너무 비슷해 보이는 문제 캡처
- `/Users/lynnchoi/Desktop/style-preview-compare.html` — 최종 확정된 dev/writing 타이포그래피 나란히 비교 레퍼런스

## 커밋 히스토리
- `Apply typography design system: unified fonts, H2 line, blockquote, links`
- `refactor: unify post-body/writing-body into shared structural rules`
- `fix: correct blockquote→takeaway-box in 4 posts + style tweaks`
- `style: align about page with design system`
