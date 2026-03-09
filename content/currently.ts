export interface CurrentItem {
  emoji: string;
  title: string;
  desc: string;
}

export const currentItems: CurrentItem[] = [
  { emoji: "🎨", title: "블로그 UI 리디자인", desc: "rauno + Linear 레퍼런스로 전면 개편 중" },
  { emoji: "💬", title: "댓글 기능 완성", desc: "GitHub Issues 기반, 오늘 배포 완료" },
  { emoji: "🤖", title: "Claude API 연동", desc: "dev log → 블로그 포스트 자동화" },
];
