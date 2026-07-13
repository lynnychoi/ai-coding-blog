# 리팩터: write/edit 통합 아키텍처

## 날짜
2026-03-21

## 배경
write/edit 페이지에 동일한 코드가 두 벌씩 존재. 앞으로 기능 추가할 때마다 양쪽 다 수정해야 하는 구조가 문제.

## 아키텍처 결정

```
/cooking/write      → 얇은 입력 폼 (재료, 프롬프트, 태그, 타입, 이미지)
                      생성 완료 시 → /cooking/edit/[slug]?new=1 로 리다이렉트

/cooking/edit/[slug] → 모든 편집 기능이 있는 단일 에디터
                       신규/기존 글 모두 여기서 처리
```

앞으로 새 기능은 edit 페이지에만 추가하면 됨.

## 공통 컴포넌트 생성

`app/cooking/components/` 디렉토리 신설:

- **`TypeStatusRow.tsx`** — 타입(dev/writing) + 공개여부(공개/비공개) 토글 한 줄
- **`TagsInput.tsx`** — 쉼표 구분 태그 입력
- **`ImageUploadList.tsx`** — 이미지 미리보기 + 설명 + 삭제 목록

## write 페이지 변경
- 성공 화면(done state) 제거
- 생성 후 `router.push('/cooking/edit/${slug}?new=1')` 리다이렉트
- 버튼 텍스트: "Claude한테 올려줘 →" → "Claude한테 초안 만들어줘 →"
- 하단 안내: "생성 후 편집 페이지에서 바로 수정할 수 있어"

## edit 페이지 변경
- `useSearchParams()`로 `?new=1` 감지
- `isNew`가 true면 상단 초록 배너 표시:
  "✦ 초안이 생성됐어. 여기서 바로 수정하거나 AI한테 더 요청해봐. 만족하면 저장하기."

## 파일
- `app/cooking/components/TypeStatusRow.tsx` (신규)
- `app/cooking/components/TagsInput.tsx` (신규)
- `app/cooking/components/ImageUploadList.tsx` (신규)
- `app/cooking/write/page.tsx` (대폭 수정)
- `app/cooking/edit/[slug]/page.tsx` (컴포넌트 교체 + isNew 배너)
