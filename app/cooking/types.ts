export type ImageEntry = { file: File; desc: string; preview: string };
export type Status = "idle" | "loading" | "done" | "error";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type ActiveTab = "ai" | "giphy" | "image";
export type EditorMode = "edit" | "preview";
export type GifResult = { id: string; title: string; preview: string; url: string };
export type NoteItem = {
  project: string;
  filename: string;
  path: string;
  date: string;
  // 이 노트로 쓴 글이 있는지 (없으면 undefined)
  usedStatus?: "published" | "unpublished";
  usedSlug?: string;        // 연결된 글 slug
  usedMatch?: "exact" | "guess"; // exact=sourceNotes로 정확히 연결, guess=내용 비교 추정
};
export type Fields = {
  title: string;
  date: string;
  datetime: string;
  tags: string;
  type: string;
  notes: string;
  status: "published" | "unpublished";
  sourceNotes: string; // 콤마로 구분된 원본 노트 경로 목록 (보존용)
};
