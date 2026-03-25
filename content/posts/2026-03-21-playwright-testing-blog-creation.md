---
title: "내가 만든 블로그를 로봇이 대신 테스트해준다"
date: 2026-03-21
datetime: 2026-03-21T00:00
tags: []
type: dev
notes: "- Playwright로 글 생성 테스트 - write→edit 리다이렉트 확인 - 공통 컴포넌트 동작 확인"
---
# 내가 만든 블로그를 로봇이 대신 테스트해준다

## 하나씩 붙을수록 불안해졌다

블로그 기능이 하나둘 붙으면서 슬슬 **불안해지기 시작했다**.

글 쓰기 페이지에서 저장 누르면 편집 페이지로 잘 넘어가나? 태그 필터는 아직도 되나? 댓글 컴포넌트 안 깨졌나? 새 기능 하나 추가할 때마다 이전에 만든 것들을 일일이 클릭해서 확인하는 게 일이 됐다.

처음엔 그냥 브라우저 열고 직접 눌러봤다. 근데 이게 매번 하려니까 귀찮은 정도를 넘어서 **빠뜨리게 된다**. *"아 이건 지난번에 됐으니까 괜찮겠지"* 하고 넘어가는 순간, 그게 깨져 있다.

![Truck GIF by ViralHog](https://media.giphy.com/media/0tf84HkzGV1y6JgjfI/giphy.gif)

그래서 *Playwright*를 도입했다.

> **Playwright란?** 브라우저를 자동으로 조작해주는 도구다. 내가 직접 클릭하고 타이핑하는 걸 코드로 짜놓으면, 로봇이 대신 해준다.

---

## 글 쓰기 → 편집 페이지로 넘어가는지 확인

제일 먼저 테스트한 건 **글 생성 흐름**이었다.

블로그 어드민에서 새 글을 쓰고 저장을 누르면, 자동으로 편집 페이지로 *리다이렉트*되어야 한다. 단순한 흐름인데, 이게 한번 깨지면 글을 쓰고도 저장이 된 건지 안 된 건지 알 수가 없다.

> **리다이렉트란?** 어떤 페이지에서 다른 페이지로 자동으로 넘겨주는 것. 로그인하면 홈으로 돌아가는 것처럼.

Playwright 테스트를 돌리면 이런 일이 벌어진다:

1. 로봇이 브라우저를 연다
2. 글쓰기 페이지로 간다
3. 제목이랑 내용을 자동으로 입력한다
4. 저장 버튼을 누른다
5. 편집 페이지로 잘 넘어갔는지 확인한다

이걸 내가 매번 할 필요가 없다. **코드 한 줄이면 전부 돌아간다.**

![Artificial Intelligence Dancing GIF](https://media.giphy.com/media/tczJoRU7XwBS8/giphy.gif)

---

## 공통 컴포넌트도 같이 확인

글 생성만 테스트한 게 아니다. 여러 페이지에서 공통으로 쓰이는 *컴포넌트*들도 확인했다.

> **컴포넌트란?** 레고 블록 같은 거다. 댓글 영역, 태그 필터, 네비게이션 바 같은 걸 각각 블록으로 만들어두고 여기저기 조립해서 쓴다. 한 쪽에서 수정하면, 나머지가 공통적으로 수정돼야 할 때 이렇게 컴포넌트를 만들어 쓰는 게 관리하기 편하다.

그런데 공통 컴포넌트가 **문제가 될 때도 있다**. 하나를 고치면 그걸 쓰는 모든 페이지에 영향이 간다. 네비게이션 바를 살짝 수정했는데 글 목록 페이지에서 레이아웃이 깨지는 식이다. ~~설마 이것까지 영향 가겠어?~~ 간다. 매번 간다.

Playwright로 주요 페이지들을 한 바퀴 돌리면 이런 걸 잡아준다. 로봇이 각 페이지를 열어보고, 있어야 할 요소가 있는지, 클릭하면 반응하는지 확인한다. 문제가 있는지 보고 문제가 있으면 알아서 고치게 될 거다 이젠.

![Penguin Fixing GIF by Pudgy Penguins](https://media.giphy.com/media/YBEIk8tFNheO9uLauf/giphy.gif)

---

## 이제 검수는 내가 안 해도 된다.

테스트 코드를 짜는 것 자체도 Claude한테 시켰다. *"이 페이지에서 글을 쓰고 저장하면 편집 페이지로 넘어가는지 테스트해줘"* 하고 말하면 Playwright 코드를 만들어준다.

기획자 시절에는 *QA 체크리스트*를 만들어서 팀원들한테 넘겼다. 예를 들면 이 버튼 누르면 이 페이지로 가야 한다, 이 입력값은 입력하면 에러가 나야 한다, 이런 것들을 전달했다. 지금은 그 QA 체크리스트를 **코드로 바꾼 셈**이다. 근데 사람이 아니라 로봇이 실행한다.

![Work Working GIF by VeeFriends](https://media.giphy.com/media/LfSVIrmSEEBFhhxVq7/giphy.gif)

이게 되니까 마음이 좀 놓인다. 새 기능을 추가하고 테스트를 돌렸을 때 **초록불이 뜨면**, 적어도 기존에 만든 것들은 안 깨졌다는 뜻이니까.

![Reassuring Jimmy Fallon GIF by The Tonight Show Starring Jimmy Fallon](https://media.giphy.com/media/e9hRgPKipZqgy8sYFP/giphy.gif)

---

<div class="takeaway-box">만드는 것보다 <strong>만든 걸 안 깨뜨리는 게</strong> 더 어렵다. 오늘부터는 그걸 로봇한테 맡기는 거다.</div>

![Working Trust Me GIF by VaynerSpeakers](https://media.giphy.com/media/cIovnRrfafDYQB8Fh4/giphy.gif)
