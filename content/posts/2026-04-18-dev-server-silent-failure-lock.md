---
title: "에러는 났고, 나는 몰랐고, 한 시간이 지났다"
date: 2026-04-18
datetime: 2026-04-18T18:00
tags: ["삽질", "Next.js", "dev-server"]
type: dev
status: published
notes: "dev server 1시간 디버깅 — lock 파일 문제"
---

# 에러는 났고, 나는 몰랐고, 한 시간이 지났다

## 증상은 이거였다

`npm run dev`를 실행하면 이렇게 뜬다.

```
▲ Next.js 16.1.6 (Turbopack)
- Local: http://localhost:3011

✓ Starting...
```

그리고 아무 일도 일어나지 않는다.

30초 기다렸다. 1분 기다렸다. 5분 기다렸다. `http://localhost:3011` 열어봤다. 연결 거부.

`✓ Starting...` 은 계속 떠 있다. ~~이 상태가 성공인 건가 실패인 건가.~~

---

## 내가 시도한 것들

### 포트 바꾸기

3011이 문제인가 싶어서 3012, 3013... 3019까지 다 써봤다. 전부 `✓ Starting...`에서 멈췄다.

### `.next` 캐시 삭제

```bash
rm -rf .next && npm run dev -- --port 3011
```

마찬가지. 오히려 더 느려졌다. 캐시가 없으니까.

### Turbopack 끄기

Next.js 16은 *Turbopack*이라는 새 빌드 도구를 기본으로 쓴다. 이게 문제인가 싶어서 `--no-turbo`를 붙여봤다. `unknown option` 에러가 났다. `--webpack`으로 다시 시도했다.

> Turbopack이란? Next.js가 코드를 브라우저가 읽을 수 있게 변환하는 도구다. 공장 컨베이어 벨트 같은 것.

webpack으로 바꿔도 **똑같이 멈췄다.** Turbopack 문제가 아니었다.

이 시점에서 나는 Claude에게 "근본 원인을 좀 찾아보지?"라고 했다. *솔직히 좀 화가 났다.*

---

## 진짜 원인은 stderr에 숨어 있었다

터미널에서 `npm run dev`를 실행하면 메시지가 한 곳에 섞여서 나온다.

> stdout이란? 프로그램이 정상적으로 출력하는 메시지 창구다.

> stderr란? 에러 메시지만 따로 출력하는 창구다. 같은 터미널에 섞여 보이기도 하지만, 프로그램마다 다르다.

Claude가 이 둘을 분리해서 실행해봤다. stderr만 따로 파일에 저장하게.

```bash
node node_modules/.bin/next dev --port 3019 1>/tmp/stdout.txt 2>/tmp/stderr.txt
```

stderr 파일을 열었더니:

```
⨯ Unable to acquire lock at .next/dev/lock,
  is another instance of next dev running?
```

**이게 전부였다.** 이 에러가 나고 있었는데, 터미널 화면에는 보이지 않았던 거다.

---

## `.next/dev/lock` 이 뭔가

`next dev`는 실행될 때 **자물쇠 파일**을 하나 만든다. "나 지금 쓰고 있음" 표시. 공용 화장실 문에 거는 사람 있음 표시 같은 것.

서버를 끌 때 이 파일이 같이 지워지는 게 정상이다. 그런데 `pkill` 같은 방법으로 프로세스를 **강제로** 죽이면 파일이 그대로 남는다. 화장실 문 열쇠를 안에 둔 채로 창문으로 탈출한 거다.

그 다음에 `next dev`를 다시 실행하면 → 자물쇠 파일 발견 → 조용히 포기.

포기했다는 말은 **stderr에만** 쓴다. 화면에는 아무것도 안 나온다.

이 세션에서 서버를 껐다 켰다를 여러 번 반복하면서 lock 파일이 쌓인 거였다.

> !! 에러가 없는 게 아니었다. 에러가 보이지 않는 곳에 있었다.

---

## 해결법은 한 줄이었다

```bash
pkill -9 -f "next" && rm -rf .next/dev/lock && npm run dev -- --port 3011
```

프로세스 완전히 종료, 자물쇠 파일 삭제, 다시 실행.

한 가지 더. 이렇게 깨끗이 시작해도 첫 실행은 **8분**이 걸렸다. Node.js 최신 버전과 Turbopack 조합이 첫 컴파일에 엄청 오래 걸리는 것 같다. `✓ Starting...` 이후로도 한참 기다려야 한다. 두 번째부터는 1초도 안 걸린다.

---

## 다음에 안 열리면

```bash
# 1. 자물쇠 파일 확인
ls .next/dev/lock

# 2. 있으면
pkill -9 -f "next" && rm -rf .next/dev/lock

# 3. 그래도 안 되면 에러 직접 확인
npm run dev 2>/tmp/err.txt & sleep 5 && cat /tmp/err.txt
```
