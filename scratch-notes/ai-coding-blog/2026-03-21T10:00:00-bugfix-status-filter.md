# 버그픽스: 비공개 저장 후 필터 안 걸리는 문제

## 날짜
2026-03-21

## 문제
편집 페이지에서 글 status를 `unpublished`로 저장해도, 대시보드 "비공개" 필터에 안 걸림.

## 원인
- `commitToGitHub()`은 GitHub에만 씀
- `getAllPosts()`는 **로컬 `content/posts/`** 파일을 읽음
- 로컬 파일은 그대로 → 필터가 stale 데이터 봄

## 해결
`PUT /api/admin/posts/[slug]` 핸들러에 dev 환경 로컬 파일 동기화 추가:

```ts
if (process.env.NODE_ENV === "development") {
  const localPath = path.join(process.cwd(), "content", "posts", `${slug}.md`);
  fs.writeFileSync(localPath, markdown, "utf-8");
}
```

`POST /api/write`도 동일하게 적용 — 신규 글 생성 후 대시보드에 즉시 반영됨.

## 파일
- `app/api/admin/posts/[slug]/route.ts`
- `app/api/write/route.ts`
