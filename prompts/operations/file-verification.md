# 파일/코드 수정 전 확인 원칙

컨텍스트 요약이나 이전 대화만 믿고 수정하지 말 것.
수정 전에 반드시 실제 파일을 직접 확인한다.

## 원칙

- 링크, 경로, 라우트 수정 전 → `ls` 또는 `Glob`으로 실제 디렉토리 구조 확인
- 컴포넌트 수정 전 → `Read`로 현재 파일 내용 확인
- "이전에 이렇게 했다" → 직접 읽어서 확인 후 수정

## 사고 사례
2026-03-20: AdminBar에서 `/cooking`으로 링크 고친다며 `/admin`으로 잘못 연결.
`ls app/`만 했어도 `/cooking`이 있다는 걸 바로 알 수 있었음.

## 이 프로젝트 핵심 구조 (항상 확인)
- 어드민 영역: `app/cooking/` (not `app/admin/` — 삭제됨)
- 어드민 URL: `/cooking`, `/cooking/write`, `/cooking/edit/[slug]`
- API 라우트: `app/api/admin/` (내부용, URL에 admin이 들어가도 무관)
