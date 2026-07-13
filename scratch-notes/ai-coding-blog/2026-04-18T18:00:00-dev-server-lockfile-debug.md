# dev server가 1시간 동안 안 열린 이유

날짜: 2026-04-18  
작업 시간: 약 1시간  
결론: `.next/dev/lock` 스테일 파일 + Turbopack 첫 컴파일 8분

---

## 한 줄 요약 (개발 모르는 사람 버전)

> `next dev`는 실행할 때 "나 쓰고 있음" 자물쇠 파일을 만들어. 프로세스를 강제로 껐을 때 이 파일이 안 지워지면, 다음 실행 때 "이미 누가 쓰고 있네" 하고 조용히 포기함. **포기했다는 말을 안 해줘서** 그냥 멈춘 것처럼 보임. 자물쇠 파일 지우면 해결.

---

## 증상

`npm run dev -- --port 3011` 실행하면:

```
> ai-coding-blog@0.1.0 dev
> next dev --port 3011

▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:3011
- Environments: .env.local

✓ Starting...
```

여기서 멈춤. `ready` 메시지가 영원히 안 뜸. 브라우저에서 `http://localhost:3011` 열면 연결 거부.

30초, 1분, 5분 기다려도 똑같음.

---

## 삽질 과정

### 시도 1 — 포트 바꾸기
3011 → 3012 → 3013 → ... 3019까지 시도. 다 똑같이 `✓ Starting...`에서 멈춤.

### 시도 2 — .next 캐시 삭제
```bash
rm -rf .next && npm run dev -- --port 3011
```
마찬가지. 오히려 더 느려짐 (캐시 없으니까).

### 시도 3 — Turbopack 문제라고 가정
`--no-turbo` 시도 → `unknown option` 에러  
`TURBOPACK=0` 환경변수 시도 → 무시됨, 여전히 Turbopack  
`--webpack` 플래그 시도 → webpack으로 실행되는데도 **똑같이 멈춤**

→ Turbopack이 원인이 아님을 이 시점에서 확인.

### 시도 4 — stderr 분리해서 실제 에러 확인
```bash
node node_modules/.bin/next dev --port 3019 1>/tmp/stdout.txt 2>/tmp/stderr.txt &
sleep 40
cat /tmp/stderr.txt
```

**여기서 진짜 에러 발견:**
```
⨯ Unable to acquire lock at /Users/lynnchoi/Desktop/Code2026/ai-coding-blog/.next/dev/lock,
  is another instance of next dev running?

  Suggestion: If you intended to restart next dev, terminate the other process, and then try again.
```

에러가 **stderr**로만 출력되고, 터미널에서는 `✓ Starting...` 다음에 아무것도 안 보임.

---

## 진짜 원인 1: Lock 파일 누적

`next dev`는 `.next/dev/lock` 파일을 만들어서 중복 실행을 막음.

문제는 `pkill -f "next"` 같은 강제 종료를 여러 번 반복하다보면 이 파일이 안 지워지는 경우가 생김. 특히:
- Claude Code가 `npm run dev` 백그라운드로 여러 번 실행
- 사용자도 터미널에서 따로 실행
- 프로세스는 죽었지만 lock 파일은 남음

그 결과:
- 새 프로세스 시작 → lock 파일 이미 있음 → 실행 포기
- 하지만 "포기했다"는 메시지가 **터미널 화면에 안 보임** (stderr만)
- 사용자 입장에선 그냥 멈춘 것처럼 보임

### 수동 확인 방법
```bash
ls -la .next/dev/lock
```

### 고치는 법
```bash
pkill -9 -f "next"
rm -rf .next/dev/lock
npm run dev -- --port 3011
```

---

## 진짜 원인 2: Turbopack 첫 컴파일 8분 28초

lock 파일 지우고 깨끗하게 시작해도 첫 번째 실행은 엄청 느림.

```
✓ Starting...
○ Compiling proxy ...
✓ Ready in 508.8s          ← 8분 28초
○ Compiling / ...
GET / 200 in 7.0min (compile: 7.0min, render: 1381ms)
```

이유: Node.js v25.1.0 + Next.js 16.1.6 Turbopack 조합에서 첫 컴파일이 극도로 느림. `.next` 캐시가 없으면 더 느림.

두 번째 페이지 로드부터는 정상:
```
GET / 200 in 925ms (compile: 15ms, render: 910ms)
```

---

## Next.js 16 달라진 점 (함정)

이전 버전: `✓ Ready in X.Xs` 메시지가 빠르게 뜨고 포트 열림  
Next.js 16 Turbopack: `✓ Starting...` 찍고 → 한참 후에 `✓ Ready in Xs` → 그 다음 포트 열림

즉 `✓ Starting...`은 준비 완료가 **아님**. 그냥 시작 중이라는 뜻.

터미널 화면에 `✓ Ready in Xs`가 뜰 때까지 기다려야 함.  
단, 이게 첫 실행이면 8분 걸릴 수 있음.

---

## 다음에 안 열리면 체크리스트

1. **lock 파일 확인**
   ```bash
   ls .next/dev/lock
   ```
   있으면:
   ```bash
   pkill -9 -f "next" && rm -rf .next/dev/lock
   ```

2. **stderr 분리 확인** (에러 안 보일 때)
   ```bash
   npm run dev -- --port 3011 2>/tmp/err.txt &
   sleep 5 && cat /tmp/err.txt
   ```

3. **기다리기** — lock 없이 시작했으면 첫 컴파일 최대 10분 기다릴 것. `✓ Ready in Xs` 뜰 때까지.

4. **그래도 안 되면** `.next` 전체 삭제
   ```bash
   rm -rf .next && npm run dev -- --port 3011
   ```

---

## 교훈

- `next dev` 에러는 stderr로 나오는데, 터미널에서 npm script로 실행하면 stdout/stderr가 섞여서 에러가 묻힘
- `✓ Starting...` = 아직 준비 안 됨 (Next.js 16)
- 프로세스를 여러 번 강제 종료하면 lock 파일이 쌓임. 재시작 전에 항상 `rm .next/dev/lock` 먼저.
- Node.js 버전이 높을수록 (v25) Turbopack 첫 컴파일이 느릴 수 있음
