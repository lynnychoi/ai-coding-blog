# 디자이너 본능이 발동한 주 — 타이포그래피 시스템 + 스타일 가이드 (합본)

> 합본 노트. 원본:
> - 2026-03-23T20:00:00-typography-design-system-refactor.md
> - 2026-03-25T00:00:00-style-guide-setup.md

## 프로젝트 한 줄 소개

Lynn의 개인 블로그. 글은 두 종류 — 개발 과정 기록(`dev`)과 에세이·감상(`writing`). 기능은 다 만들어놨는데 막상 글을 올리기 시작하니까 디자인이 거슬리기 시작했고, 디자이너 출신 본능이 발동했다.

## 이 작업을 하게 된 이유

글을 올리기 시작하니까 보이는 것들이 생겼다.
- 폰트가 뭔가 어색하고
- H2가 dev/writing에서 다르게 생겼고 (한쪽은 `border-bottom`, 다른 쪽은 `border-left`)
- blockquote랑 H2가 비슷해 보이고
- 섹션 구분이 모호하고
- 한 번 쓴 마크다운 문법(def-box, takeaway-box)을 며칠 후엔 내가 까먹어서 매번 기존 글 뒤져가며 복사하고 있고

**"나 디자이너잖아. 갑자기 질리면 가장 쉽게 바꿀 수 있는 게 디자인이어야 해."** 이 한 마디가 이번 주 작업의 방향을 결정했다.

크게 두 갈래로 진행 — **3/23 타이포그래피·디자인 시스템 전면 개편 → 3/25 스타일 가이드 문서화**.

## 뭘 했나

### 1. 통일성 맞추기 (3/23)

- **H2 통일** — dev는 `border-bottom`, writing은 `border-left`였다. 같은 블로그인데 글 타입에 따라 H2가 완전 다른 스타일.
- **영어+한글 폰트 베이스라인** — `font-family: 'Figtree', 'Pretendard', sans-serif` 처럼 영어 폰트 앞·한글 폰트 뒤 순서로 두면, 브라우저가 문자 종류에 따라 자동 선택. 베이스라인 어긋남 해결.
- **CSS 트리 통합** — `.post-body`와 `.writing-body`에 같은 구조 규칙(H2, H3, blockquote, ul, 링크)이 각각 중복으로 들어 있었다. 일단 둘 따로 맞추고 나중에 통합하기로.
- **`def-box` 색상 하드코딩 제거** — `color: var(--accent)`로만 돼 있어서 dev든 writing이든 항상 민트로 나왔다. `var(--article-accent)`로 변수화.
- **`tag-filter-btn`에 박혀 있던 Inter 폰트** — 이 프로젝트에서 안 쓰는 폰트. 어딘가 복붙 흔적. 제거.

### 2. 예쁘게 만들기 — 결정이 제일 힘들었다 (3/23)

- **폰트 페어링 확정**:
  - **Dev**: Figtree (영문) + Pretendard (한글) — 모던하고 약간 기술적
  - **Writing**: Hanken Grotesk + Gowun Dodum — 더 부드럽고 인간적, 손글씨 느낌
  - **공통 모노스페이스**: Fira Code — "기술적인 것들은 다 Fira Code"라는 규칙
- **H2 스타일** — border-left는 blockquote랑 비슷해서 안 됨. **텍스트 위에 짧은 가로선** (`::before`)으로 방향 전환. 길이 10/15/20/30/50px 비교 → 30px 확정. H2 아래 여백도 0.75rem → 1.5rem로 2배.
- **Blockquote 스타일 (제일 오래 걸린 결정)** — 인용부호, 상단+하단 선, 점선, 양쪽 선… 옵션을 엄청 봤다. 결국 **왼쪽 1px solid 선**으로 확정. H2(위에 가로선) vs blockquote(왼쪽에 세로선) — 방향이 달라서 구별됨.
- **링크와 강조 밑줄 분리**:
  - `<a>` 링크: 회색 밑줄 (`var(--text-3)`) — 외부 링크 권장 안 함
  - `<u>` 강조: accent 색 밑줄 — 의도적 강조용
- **HR 구분선을 텍스트 기호로** — H2 위 짧은 선이랑 헷갈리지 않게. Dev는 `// ---` (코드 주석 스타일), Writing은 `· · ·` (문학 스타일). `hr::after`로 구현.

### 3. 구조적으로 다른 본문 밀도 (3/23)

- **Dev 본문**: `font-size: 0.93rem`, `line-height: 1.85` → 빠르게 읽히는 밀도
- **Writing 본문**: `font-size: 0.96rem`, `line-height: 2.0` → 여유 있게 읽히는 밀도
- 폰트 크기 차이 0.03rem이지만 줄간격 차이가 읽는 느낌을 꽤 다르게 만든다.
- **Writing H1**: 하늘색→라벤더 그라데이션. Dev는 plain white.
- **Writing 이미지**: `transform: rotate(-0.8deg)` 살짝 기울어지고 box-shadow. Dev는 반듯·border만.
- **Takeaway-box vs Blockquote 기준 명확화**:
  - Takeaway-box: 글 전체의 핵심 결론. 1글당 1개.
  - Blockquote: 흐름 중 강조, 인용, 용어 설명.
  - 기존 글 8개 확인 → 4개에서 결론 문장이 blockquote로 잘못 쓰여 있어 takeaway-box로 수정.

### 4. CSS 변수 리팩터 (3/23)

`.post-body`와 `.writing-body` 중복 규칙을 CSS 변수로 분리.

```css
.post-body  { --article-accent: #06d6a0; }  /* mint */
.writing-body { --article-accent: #c4b5fd; }  /* lavender */

.post-body h2::before,
.writing-body h2::before {
  background: var(--article-accent);  /* 각자 색으로 자동 */
}
```

결과: 119줄 추가, 171줄 삭제. 52줄 줄었다.

**About 페이지도 연결** — 인라인 스타일로 쓰여 있던 blockquote 색상(`rgba(6, 214, 160, 0.45)` 하드코딩) 제거 → outer wrapper에 `className="post-body"` 추가 → CSS 변수 체계에 연결.

**Desktop에 레퍼런스 파일** — `/Users/lynnchoi/Desktop/style-preview-compare.html`. 실제 블로그 CSS와 별도로 미리 보고 결정하기 위한 비교 파일. Dev/Writing 두 컬럼 나란히. 실제 변경 전 여기서 먼저 확인.

### 5. 스타일 가이드 만들기 (3/25)

이틀 뒤, 위에서 만든 시스템을 내가 다시 못 찾고 있었다. blockquote 문법이 `>`인지, def-box가 `> 단어란?`인지 `// 단어란?`인지(둘 다 쓰는 문법이라 더 헷갈림) 매번 기존 글 뒤져 복사하는 짓을 반복. **"내가 만든 문법인데 내가 기억을 못 하는 거다."**

→ `public/style-guide.html` 단일 HTML 파일로 만듦. 마크다운 문법 치트시트 + 각 요소가 dev/writing 두 컬럼에서 어떻게 렌더링되는지 한 페이지에.

**섹션 구성:**
```
00 · Markdown Cheat Sheet
01 · Headings
02 · Block Elements (blockquote, def-box, takeaway-box)
03 · Lists
04 · Inline Text
05 · Image / GIF (both)
06 · Code Block (dev only)
07 · Table (dev only)
08 · HR
09 · Color Reference
```

**어드민에서 바로 열게:**
- Cooking Station 메인 — "📖 Style Guide" 버튼
- `/cooking/write` 상단 바 — `📖 Style`
- `/cooking/edit/[slug]` 상단 바 — `📖 Style`
- 모두 `target="_blank"` 새 탭

## 막혔던 것들 / 삽질

- **blockquote 옵션 논의가 너무 길어졌다** — "B랑 C 다 괜찮아 보여" → "C 좋은데 양옆 점선 어때?" → "텍스트 끝날 때 선도 끝나야 하지 않아?" → "모르겠어 어떤 게 나아?" 결국 H2를 위 가로선으로 바꾸면서 blockquote는 왼쪽 세로선으로 확정. 결론에 이르는 옵션이 너무 많았다.
- **두 파일 sync 유지가 번거로움** — 실제 블로그 CSS 바꾸면 Desktop의 compare HTML도 같이 업데이트. 한 곳만 바꾸면 레퍼런스랑 실제가 달라진다.
- **Git 삽질** — `content/posts/2026-03-21-playwright-testing-blog-creation.md`가 local에 untracked, remote에 5번 수정된 상태. `git pull`에서 충돌. 로컬 백업 후 삭제 → `git pull --rebase` → 그 위에 내 커밋 rebase.
- **style-guide HTML 위치 변경** — 처음에 `scratch-notes/`에 뒀다가 `public/`으로 이전. 두 곳에 두면 무조건 한쪽이 stale. 단일 소스로.
- **`git add app/cooking/edit/[slug]/page.tsx`** — 쉘이 `[slug]`를 glob으로 해석. 따옴표 필수.
- **치트시트 순서 vs 섹션 순서가 달랐다** — 처음에 치트시트(중요도 순)와 섹션 순서가 안 맞았다. 일관성 위해 동일하게 재정렬.
- **Image/GIF를 dev 전용으로 잘못 분류** — writing 글에도 GIF 씀. "both"로 수정.

## 결정의 이유

- **HTML 한 파일로 스타일 가이드** — 블로그 실제 CSS를 그대로 적용해야 의미가 있다. 컴포넌트로 만들면 라우팅·빌드에 엮이고, `.md`로는 커스텀 CSS 적용 안 됨. HTML + `<style>` 태그가 가장 가볍고 독립적.
- **`public/` 폴더** — Next.js가 빌드 없이 정적 서빙. URL 깔끔(`/style-guide.html`), 별도 라우팅 불필요.
- **CSS 변수는 "나중에 바꾸기 위한 것"** — 지금 동작이 아니라 나중에 최소 수정으로 전체 바꿀 수 있는 구조.
- **dev/writing 두 컬럼 동시 표시** — 같은 가이드를 두 타입 글 쓸 때 모두 씀. 해당 안 되는 요소는 "해당 없음" 표시해 혼란 방지.

## 그때 어떤 기분이었나

이 작업은 기능 개발이 아니라 **취향 결정의 연속**이었다. 정답이 없는 질문을 계속 받는 느낌.

제일 힘들었던 건 blockquote 옵션 논의. 인용부호, 상단+하단 선, 점선, 양쪽 선, 왼쪽만… 여러 방향을 HTML 파일로 만들어 비교하면서 결정 못 하는 시간이 길었다. 결론이 나오기까지 꽤 헤맸다.

스타일 가이드 만들기 전엔 솔직히 "굳이?" 싶었다. 마크다운 문법 몇 개 외우면 되는 거 아닌가. 근데 막상 만들고 나서 편집 페이지 켜고 옆에 스타일 가이드 띄워두니까 — 진짜로 편하다. **처음으로 "내가 만든 도구를 내가 쓰고 있다"는 느낌이 났다.**

CSS 변수로 리팩토링하는 방향은 Lynn이 "나 디자이너니까 갑자기 스타일 뒤집을 수 있어"라고 말했을 때 즉시 결정됐다. 요구사항이 명확하면 설계가 빠르다.

## 배운 것 / Takeaway

- **CSS 변수는 미래의 나를 위한 것** — 지금 동작이 아니라 나중에 색 하나 바꿔서 전체 테마가 따라오게.
- **영어+한글 폰트 페어링은 순서가 중요** — 영어 앞, 한글 뒤. 브라우저가 자동 선택.
- **Blockquote vs Takeaway-box 기준** — 흐름 중 강조는 blockquote, 글 전체 결론은 takeaway-box.
- **디자인 결정은 "왜"가 없으면 다시 뒤집게 된다** — H2 선 30px, 회색 링크, HR 기호 — 이유가 있어야 흔들리지 않는다.
- **단일 소스 원칙** — 같은 내용이 두 군데 있으면 반드시 한쪽이 stale이 된다.
- **내가 만든 시스템도 시간 지나면 내가 까먹는다** — 레퍼런스 문서를 만들어둬야 한다. 미래의 나에게 보내는 메모.
- **`public/` 폴더** — 빌드 없이 정적 서빙. 관리 도구, 레퍼런스 문서에 유용.
- **핵심 한 줄**: 색상 변수 하나만 바꾸면 전체 테마가 바뀌는 구조 + 그 시스템을 내가 다시 찾을 수 있는 레퍼런스. 디자이너가 개발을 배우면 이런 걸 왜 하는지 비로소 이해된다.

## 스크린샷 (원본 노트 참고)

- `screenshots/2026-03-23-typography/01~06.png` — 홈, dev 포스트, writing 포스트, about 페이지
- `screenshots/style-guide-2026-03-25/00~09.png` — 치트시트 + 섹션별
