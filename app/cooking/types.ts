export type ImageEntry = { file: File; desc: string; preview: string };
export type Status = "idle" | "loading" | "done" | "error";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type ActiveTab = "ai" | "giphy" | "image";
export type EditorMode = "edit" | "preview";
export type GifResult = { id: string; title: string; preview: string; url: string };
export type NoteItem = { project: string; filename: string; path: string; date: string };
export type Fields = {
  title: string;
  date: string;
  datetime: string;
  tags: string;
  type: string;
  notes: string;
};
