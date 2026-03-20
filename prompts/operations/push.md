# git push 전 체크리스트

Lynn은 Cooking Station(어드민)에서 글을 수정하면 GitHub API로 직접 커밋이 생긴다.
내 로컬 git과 충돌할 수 있으므로 push 전에 반드시 아래 순서를 따른다.

## 순서

1. `git fetch origin` — 원격 최신 상태 가져오기
2. `git log HEAD..origin/main --oneline` — 원격에만 있는 커밋 확인
3. 원격에 커밋이 있으면 → `git rebase origin/main` 후 push
4. 없으면 → 바로 push

## 절대 하지 말 것

- `git pull --rebase`의 "up to date" 메시지를 그냥 믿지 말 것
- fetch 없이 바로 push하지 말 것

## 사고 사례
2026-03-20: Lynn이 글 수정 저장 → GitHub 커밋 생김 → 내가 fetch 없이 push → Lynn 커밋 덮어씀
