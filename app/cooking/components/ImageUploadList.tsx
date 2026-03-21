"use client";

import { useRef } from "react";
import { COMMON } from "../styles";
import type { ImageEntry } from "../types";

interface ImageUploadListProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  label?: string;
}

export default function ImageUploadList({ images, onChange, label = "이미지" }: ImageUploadListProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file =>
      onChange([...images, { file, desc: "", preview: URL.createObjectURL(file) }])
    );
    e.target.value = "";
  };

  const handleDescChange = (i: number, desc: string) =>
    onChange(images.map((img, j) => j === i ? { ...img, desc } : img));

  const handleRemove = (i: number) =>
    onChange(images.filter((_, j) => j !== i));

  return (
    <div>
      {label && (
        <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: 1, display: "block", marginBottom: 6 }}>
          {label} <span style={{ color: "#3a3a5a", fontWeight: 400, textTransform: "none" as const }}>(선택)</span>
        </label>
      )}
      {images.map((img, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: "#13131e", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.preview} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
          <input
            type="text"
            value={img.desc}
            onChange={e => handleDescChange(i, e.target.value)}
            style={{ flex: 1, background: "transparent", border: "none", color: "#aaa", fontSize: 13, outline: "none" }}
            placeholder="이미지 설명..."
          />
          <button onClick={() => handleRemove(i)} style={{ background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
      ))}
      <button onClick={() => fileRef.current?.click()} style={{ ...COMMON.smallBtn, width: "100%" }}>+ 이미지 추가</button>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAdd} />
    </div>
  );
}
