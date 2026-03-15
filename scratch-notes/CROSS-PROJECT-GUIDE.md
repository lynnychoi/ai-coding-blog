# 크로스 프로젝트 블로그 재료 수집 가이드

> 다른 프로젝트에서 작업한 내용을 이 블로그로 가져오는 방법 정리.

---

## 전체 구조

```
~/Desktop/Code2026/
│
├── ai-coding-blog/              ← 블로그 (이 프로젝트)
│   └── scratch-notes/
│       ├── HOW-TO-WRITE.md      ← 기록 형식 가이드
│       ├── CROSS-PROJECT-GUIDE.md  ← 이 파일
│       ├── ai-coding-blog/      ← 이 블로그 작업 기록
│       ├── steppay-tools/  →→→  steppay-tools/scratch-notes/ (심볼릭 링크)
│       ├── wallet-couple/  →→→  wallet-couple/scratch-notes/  (심볼릭 링크)
│       └── claude-guide/   →→→  claude-guide/scratch-notes/   (심볼릭 링크)
│
├── steppay-tools/
│   └── scratch-notes/           ← 여기 기록하면 블로그에서 바로 보임
│
├── wallet-couple/
│   └── scratch-notes/           ← 여기 기록하면 블로그에서 바로 보임
│
└── claude-guide/
    └── scratch-notes/           ← 여기 기록하면 블로그에서 바로 보임
```

**심볼릭 링크란?** 다른 프로젝트 폴더를 이 블로그 `scratch-notes/` 안에 연결해둔 것.
다른 프로젝트에서 파일을 만들면 블로그에서도 자동으로 보임. 파일을 두 번 관리할 필요 없음.

---

## 지금 당장 할 일 (기존 프로젝트 활성화)

steppay-tools, wallet-couple, claude-guide 각 프로젝트 `.env`에 추가:

```
BLOG_URL=https://lynn-ai-blog.vercel.app
BLOG_SECRET=블로그_어드민_비밀번호
```

`BLOG_SECRET`은 블로그 로그인 비밀번호랑 같은 값. 이것만 하면 업로드 스크립트 쓸 수 있음.

---

## 새 프로젝트 추가할 때

새 프로젝트가 생겼을 때 딱 한 번만 하면 됨. (새프로젝트이름 → 실제 폴더명으로 바꿔서)

```bash
# 1. scratch-notes 폴더 + 가이드 복사
mkdir -p ~/Desktop/Code2026/새프로젝트이름/scratch-notes
cp ~/Desktop/Code2026/ai-coding-blog/scratch-notes/HOW-TO-WRITE.md \
   ~/Desktop/Code2026/새프로젝트이름/scratch-notes/

# 2. 블로그에 심볼릭 링크 연결
ln -s ~/Desktop/Code2026/새프로젝트이름/scratch-notes \
      ~/Desktop/Code2026/ai-coding-blog/scratch-notes/새프로젝트이름

# 3. 업로드 스크립트 복사
mkdir -p ~/Desktop/Code2026/새프로젝트이름/scripts
cp ~/Desktop/Code2026/steppay-tools/scripts/upload-note.ts \
   ~/Desktop/Code2026/새프로젝트이름/scripts/

# 4. .env에 추가
echo "BLOG_URL=https://lynn-ai-blog.vercel.app" >> ~/Desktop/Code2026/새프로젝트이름/.env
echo "BLOG_SECRET=블로그_어드민_비밀번호" >> ~/Desktop/Code2026/새프로젝트이름/.env
```

그리고 해당 프로젝트 CLAUDE.md에 이 섹션 복붙:

```markdown
## 블로그 재료 기록 (scratch-notes)

작업 세션이 끝나면 `scratch-notes/` 폴더에 기록을 남긴다.
Lynn의 블로그(ai-coding-blog)의 원재료가 됨.

- **파일명:** `YYYY-MM-DDTHH:MM:SS-키워드.md`
- **형식:** `scratch-notes/HOW-TO-WRITE.md` 참고
- **언제:** 흥미로운 버그, 새로 배운 것, 설계 결정, 삽질한 것이 있을 때

### 블로그에 올리기 (로컬이 아닐 때)

```bash
npx ts-node scripts/upload-note.ts scratch-notes/파일명.md
```
또는 Lynn이 "이 노트 블로그에 올려줘"라고 하면 Claude Code가 위 명령 실행.
```

---

## 각 프로젝트에서 내가 할 일

### 작업 중

별도로 할 일 없음. 그냥 작업하면 됨.

### 작업 끝났을 때 (블로그 재료 생성)

**Claude Code한테 말하면 됨:**

```
오늘 작업 내용 scratch-notes에 기록해줘
```

또는 더 구체적으로:

```
오늘 invoice 버그 고친 거 scratch-notes에 HOW-TO-WRITE.md 형식으로 기록해줘.
날짜는 지금 기준으로.
```

Claude Code가 알아서 `scratch-notes/2026-03-15T14:30:00-invoice-bug.md` 형식으로 만들어줌.

### 기록이 잘 됐는지 확인

```bash
ls ~/Desktop/Code2026/steppay-tools/scratch-notes/
# 또는
ls ~/Desktop/Code2026/ai-coding-blog/scratch-notes/steppay-tools/
# 두 경로 다 같은 파일 보여줌
```

---

## 블로그 글로 만들 때

### 방법 1: /cooking/write 에서 불러오기 (어디서나 가능)

1. 브라우저에서 `/cooking/write` 접속
2. **재료** 섹션 위의 **"📋 scratch-notes에서 불러오기"** 버튼 클릭
3. 프로젝트별로 기록 목록이 뜸
4. 원하는 기록 클릭 → 재료 칸에 자동으로 들어옴
5. Claude에게 지시사항 추가 (선택) → 제출

> **로컬 실행 중:** 심볼릭 링크로 연결된 파일을 파일시스템에서 직접 읽음
> **Vercel 배포 환경:** GitHub API로 블로그 repo의 `scratch-notes/` 폴더를 읽음
> → Vercel에서 보이려면 노트가 블로그 repo에 올라가 있어야 함 (방법 A 또는 B)

#### Vercel에서 보이게 하기

**방법 A: 다른 프로젝트에서 업로드 스크립트 실행**

각 프로젝트 `.env`에 한 번만 추가:
```
BLOG_URL=https://lynn-ai-blog.vercel.app
BLOG_SECRET=블로그_어드민_비밀번호
```

노트 올릴 때:
```bash
npx ts-node scripts/upload-note.ts scratch-notes/2026-03-15T14:30:00-파일명.md
```
또는 Claude Code에게: **"이 노트 블로그에 올려줘"**

**방법 B: 직접 복붙**
scratch-notes 파일 내용을 복사해서 `/cooking/write` 재료 칸에 붙여넣기.

---

## 현재 연결된 프로젝트

| 프로젝트 | scratch-notes 위치 | CLAUDE.md 업데이트 |
|---------|-------------------|------------------|
| ai-coding-blog | `scratch-notes/ai-coding-blog/` | ✅ |
| steppay-tools | `scratch-notes/steppay-tools/` → 심볼릭 링크 | ✅ |
| wallet-couple | `scratch-notes/wallet-couple/` → 심볼릭 링크 | ✅ |
| claude-guide | `scratch-notes/claude-guide/` → 심볼릭 링크 | ✅ |

---

## 주의사항

### 심볼릭 링크는 로컬 전용
심볼릭 링크는 내 맥북에만 있음. GitHub에 올라가지 않음.
새 맥북이나 새 환경에서는 위 "새 프로젝트 추가할 때" 과정을 다시 해야 함.

**새 환경 셋업 명령어 모아두기:**
```bash
# 심볼릭 링크 전체 재설정 (새 맥북이나 클론 후)
ln -s ~/Desktop/Code2026/steppay-tools/scratch-notes \
      ~/Desktop/Code2026/ai-coding-blog/scratch-notes/steppay-tools

ln -s ~/Desktop/Code2026/wallet-couple/scratch-notes \
      ~/Desktop/Code2026/ai-coding-blog/scratch-notes/wallet-couple

ln -s ~/Desktop/Code2026/claude-guide/scratch-notes \
      ~/Desktop/Code2026/ai-coding-blog/scratch-notes/claude-guide
```

### .gitignore
각 프로젝트의 `scratch-notes/` 폴더는 git에 올라감 (의도적).
기록이 GitHub에 남아서 백업 역할도 함.
민감한 정보(API 키, 고객 정보 등)는 scratch-notes에 쓰지 말 것.

---

## 문제 해결

**"scratch-notes에서 불러오기"를 눌러도 목록이 비어있음 (Vercel)**
→ 노트가 블로그 repo에 올라가 있어야 함. 각 프로젝트에서 `npx ts-node scripts/upload-note.ts scratch-notes/파일명.md` 실행.

**"scratch-notes에서 불러오기"를 눌러도 목록이 비어있음 (로컬)**
→ `npm run dev` 실행 중인지 확인. scratch-notes 폴더에 .md 파일이 있는지 확인.

**심볼릭 링크가 깨져 있음 (링크는 있는데 빈 폴더로 보임)**
→ 원본 프로젝트 경로가 바뀐 것. 링크 지우고 다시 만들기:
```bash
rm ~/Desktop/Code2026/ai-coding-blog/scratch-notes/프로젝트명
ln -s ~/Desktop/Code2026/새경로/scratch-notes \
      ~/Desktop/Code2026/ai-coding-blog/scratch-notes/프로젝트명
```

**다른 프로젝트에서 Claude Code가 scratch-notes에 기록 안 함**
→ 해당 프로젝트 CLAUDE.md에 "블로그 재료 기록" 섹션이 있는지 확인.
없으면 위 "새 프로젝트 추가할 때 > 4단계" 내용 추가.
