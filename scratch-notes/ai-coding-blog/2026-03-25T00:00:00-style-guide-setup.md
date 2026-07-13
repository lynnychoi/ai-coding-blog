# 블로그 스타일 가이드 만들기

## 프로젝트 한 줄 소개

Lynn(최유경)의 개인 블로그. 기획자/디자이너 출신이 Claude Code로 AI 코딩을 배우는 과정을 기록하는 곳.
글은 `/cooking` (Cooking Station)에서 쓰고 편집한다.

---

## 이 작업을 하게 된 이유

블로그에 마크다운으로 글을 쓰다 보니 문제가 생겼다.
blockquote는 `>` 인지 `>>` 인지, def-box는 어떻게 쓰는 건지, takeaway-box 문법은 뭔지 — 매번 기존 글 뒤져가며 복사하고 있었다.

심지어 어드민 편집 페이지 켜놓고 마크다운 raw 텍스트 보면서 "이게 뭔 문법이었지?" 하고 위로 스크롤해 확인하는 짓을 반복했다. 내가 만든 문법인데 내가 기억을 못 하는 거다.

그래서 **스타일 가이드**를 만들었다. 마크다운 문법 치트시트 + 각 요소가 실제로 어떻게 렌더링되는지 미리보기를 한 페이지에 모아둔 것.

---

## 뭘 했나 (작업 목록)

### 파일 위치와 접근 방법

- `public/style-guide.html` — 단일 소스. Next.js의 `public/` 폴더에 두면 `/style-guide.html`로 바로 접근 가능.
- 처음엔 `scratch-notes/style-guide.html`에 뒀다가 `public/`으로 이전. 한 곳에서만 관리하기로.
- 로컬: `http://localhost:3010/style-guide.html`
- 프로덕션: `https://[블로그도메인]/style-guide.html`

### 스타일 가이드 구성 (섹션 순서)

```
00 · Markdown Cheat Sheet  — 전체 문법 한눈에 보기 (표 형식)
01 · Headings              — h1, h2, h3 실제 렌더링
02 · Block Elements        — blockquote, def-box, takeaway-box
03 · Lists                 — ul, ol
04 · Inline Text           — strong, em, del, u, code, a
05 · Image / GIF           — 이미지 삽입 문법 + 캡션 (dev/writing 공통)
06 · Code Block            — 코드 블록 (dev 전용, writing: 해당 없음)
07 · Table                 — 표 (dev 전용, writing: 해당 없음)
08 · HR                    — 구분선 · · ·
09 · Color Reference       — 블로그 색상 팔레트
```

각 섹션은 dev 칼럼과 writing 칼럼으로 나뉘어 타입별 실제 렌더링을 보여준다.

### 핵심 마크다운 문법 정리

| 요소 | 문법 |
|------|------|
| blockquote | `> 텍스트` |
| def-box | `> **단어란?** 설명` |
| takeaway-box | `> !! 내용` |
| 이미지 | `![캡션](url)` |
| 코드 인라인 | `` `코드` `` |

### 어드민 페이지에서 스타일 가이드 열기

글을 쓰거나 편집할 때 참고할 수 있도록 세 곳에 링크 추가:

1. **Cooking Station** (`/cooking`) — "📖 Style Guide" 버튼 (새 글 쓰기 버튼 위)
2. **글 쓰기** (`/cooking/write`) — 상단 바에 `📖 Style` 버튼
3. **글 편집** (`/cooking/edit/[slug]`) — 상단 바에 `📖 Style` 버튼

모두 `target="_blank"`로 새 탭에서 열림.

### 단일 소스 원칙

처음엔 `scratch-notes/style-guide.html`과 `public/style-guide.html` 두 곳에 파일이 있었다.
변경할 때마다 두 군데 복사해야 하는 번거로움이 있어서, `scratch-notes` 버전을 git rm으로 삭제하고 `public/`만 남겼다.

`public/` 폴더는:
- Next.js가 자동으로 정적 파일로 서빙 (빌드 불필요)
- 이미 git-tracked
- `/style-guide.html` URL로 바로 접근 가능

---

## 막혔던 것들 / 삽질

### git push 충돌

style-guide 작업 중 `git push`가 rejected됐다.
원격에 먼저 올라간 커밋이 있었기 때문 (`playwright-testing` 포스트에서 takeaway-box 문법이 달랐음).

```
git pull --rebase
# 충돌 해결: > !! 문법을 유지하는 방향으로
git rebase --continue
git push
```

### `git add` 경로 문제

```bash
git add app/cooking/edit/[slug]/page.tsx  # ✗ 안 됨
git add 'app/cooking/edit/[slug]/page.tsx'  # ✓ 따옴표로 감싸야 함
```

대괄호 `[slug]`를 쉘이 glob으로 해석해버려서 안 됐다. 따옴표 필수.

### 치트시트 순서 vs 섹션 순서

처음에 치트시트(표)의 행 순서와 아래 섹션 순서가 달랐다.
치트시트는 중요도 순(h1 먼저, HR 마지막), 섹션도 같은 순서여야 일관성이 있다. 맞춰서 재정렬.

### image/GIF가 dev 전용 아님

처음에 Image/GIF를 code block, table과 같이 dev 전용으로 분류했다.
실제로는 writing 타입 글에도 GIF를 쓴다 — "both"가 맞다. 수정.

---

## 결정의 이유

### 왜 HTML 파일로 만들었나

스타일 가이드는 **블로그 실제 CSS를 그대로 적용해야** 의미가 있다.
Next.js 컴포넌트로 만들면 라우팅이나 빌드에 엮이고, `.md` 파일로 만들면 커스텀 CSS 적용이 안 된다.
HTML 파일에 `<style>` 태그로 블로그 CSS를 직접 붙여넣으면 — 독립적이고, 어디서든 열리고, 빠르다.

### 왜 `public/`에 뒀나

Next.js의 `public/` 폴더는 빌드 없이 정적으로 서빙된다. URL이 깔끔하고(`/style-guide.html`),
별도 API나 페이지 라우팅 없이도 접근 가능. 관리할 파일도 하나.

### dev/writing 구분 칼럼

같은 스타일 가이드를 dev 글 쓸 때도, writing 글 쓸 때도 쓴다.
각 타입에서 해당 안 되는 요소(예: writing에서 code block)는 "해당 없음"으로 표시해 혼란 방지.

---

## 그때 어떤 기분이었나

솔직히 이걸 만들기 전에는 "굳이?" 싶었다. 마크다운 문법 몇 개 외우면 되는 거 아닌가.

근데 막상 만들고 나서 편집 페이지 켜고 스타일 가이드 옆에 열어두니까 — 진짜로 편하다. 특히 def-box 문법이 `> **단어란?** 설명`인지 `// 단어란?`인지 헷갈릴 때(둘 다 실제로 쓰는 문법이라 더 헷갈림) 바로 확인할 수 있어서.

그리고 처음으로 "내가 만든 도구를 내가 쓰고 있다"는 느낌이 났다.

---

## 배운 것 / Takeaway

- **단일 소스 원칙**: 같은 내용이 두 군데 있으면 반드시 한 곳이 outdated된다. 처음부터 한 곳에서만 관리할 것.
- **`public/` 폴더 활용**: 빌드 없이 정적 파일 서빙. 관리 도구, 레퍼런스 문서에 유용.
- **쉘에서 `[` 글자 주의**: 파일 경로에 `[slug]` 같은 대괄호 있으면 git add 할 때 따옴표로 감싸야 함.
- **핵심 한 줄**: 내가 만든 시스템을 유지하려면, 내가 다시 봤을 때 바로 알 수 있는 레퍼런스가 있어야 한다.

---

## 스크린샷

`screenshots/style-guide-2026-03-25/` 폴더에 섹션별 저장:

- `00-cheat-sheet.png` — 전체 마크다운 치트시트
- `01-headings.png` — Headings 섹션
- `02-block-elements.png` — blockquote, def-box, takeaway-box
- `03-lists.png` — 리스트
- `04-inline-text.png` — 인라인 텍스트
- `05-image-gif.png` — 이미지/GIF
- `06-code-block.png` — 코드 블록
- `07-table.png` — 표
- `08-hr.png` — 구분선
- `09-colors.png` — 색상 팔레트
- `full-page.png` — 전체 페이지
