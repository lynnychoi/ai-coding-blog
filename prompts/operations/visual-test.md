# Visual Test 가이드

코드 수정 후 로컬 배포 전, Playwright로 스크린샷을 찍어 시각적으로 확인한다.

---

## 실행 방법

### 1. 개발 서버 시작
```bash
pkill -f "next dev" 2>/dev/null; sleep 2; rm -f .next/dev/lock
npx next dev --port 3099 > /tmp/nextdev.log 2>&1 &
sleep 6
tail -3 /tmp/nextdev.log  # "Ready" 확인
```

### 2. 스크린샷 스크립트 실행
```bash
node test-screenshots.mjs
```

### 3. 결과 확인
Claude가 `screenshots/` 폴더 이미지를 직접 Read 툴로 열어서 육안 검토.

---

## 스크린샷 스크립트 (test-screenshots.mjs)

프로젝트 루트에 `test-screenshots.mjs` 파일을 일시적으로 생성해 실행. 끝나면 삭제.

```js
import { chromium } from '@playwright/test';

// 인증 토큰 계산 (auth.ts 로직 동일)
async function computeToken(secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + "lynn-admin-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("").substring(0, 40);
}

const PORT = 3099;
const BASE = `http://localhost:${PORT}`;
const token = await computeToken('0110lynn'); // .env.local의 ADMIN_SECRET

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

// 쿠키 직접 주입 (로그인 페이지 헤드리스 자동화 우회)
await context.addCookies([{ name: 'admin_token', value: token, domain: 'localhost', path: '/' }]);

const page = await context.newPage();
await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14

// goto 헬퍼 — waitUntil: 'commit' 필수 (HMR WebSocket 때문에 load/domcontentloaded 타임아웃)
const goto = (url) => page.goto(url, { waitUntil: 'commit', timeout: 15000 });

// 찍을 페이지 목록 (작업에 따라 조정)
await goto(`${BASE}/cooking`);
await page.waitForTimeout(1500);
await page.screenshot({ path: 'screenshots/01-dashboard.png', fullPage: true });

// ... 필요한 페이지 추가

await browser.close();
```

---

## 핵심 주의사항

| 상황 | 해결 방법 |
|------|-----------|
| 서버가 이미 켜져 있어서 lock 에러 | `pkill -f "next dev"` 후 재시작 |
| Turbopack 패닉 크래시 | 서버 재시작 (`rm -f .next/dev/lock`) |
| `waitUntil: 'load'` / `'domcontentloaded'` 타임아웃 | `waitUntil: 'commit'` 사용 |
| 로그인 버튼 disabled 유지 | 쿠키 직접 주입 방식 사용 |
| `@playwright/test` not found | `npm install --save-dev @playwright/test` |

---

## 확인 체크리스트

스크린샷을 보면서 확인:
- [ ] 레이아웃 깨짐 없음 (모바일 390px 기준)
- [ ] 새로 추가한 UI 요소가 제대로 보임
- [ ] 텍스트 잘림 없음 (overflow hidden 확인)
- [ ] 버튼/필드가 너무 작거나 겹치지 않음
- [ ] 다크 모드 색상 대비 적절함

---

## 작업 완료 후 정리
```bash
rm -f test-screenshots.mjs
# screenshots/ 폴더는 .gitignore에 추가 권장
```
