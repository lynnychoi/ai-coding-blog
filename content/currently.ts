export interface CurrentItem {
  emoji: string;
  title: string;
  desc: string;
}

export const currentItems: CurrentItem[] = [
  { emoji: "🔨", title: "이 블로그 만드는 중", desc: "기능 추가, UI 다듬기, 자동화 연결" },
  { emoji: "🤖", title: "Claude API 연동", desc: "dev log → 블로그 포스트 자동화" },
  { emoji: "📐", title: "디자인 시스템 공부", desc: "코드로 직접 구현하는 경험 중" },
];
