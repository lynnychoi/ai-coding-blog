"use client";

import { COMMON } from "../styles";

interface TagsInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function TagsInput({ value, onChange }: TagsInputProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: 1, display: "block", marginBottom: 6 }}>
        태그 <span style={{ color: "#3a3a5a", fontWeight: 400, textTransform: "none" as const }}>(쉼표로 구분)</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={COMMON.input}
        placeholder="next.js, css, 실수"
      />
    </div>
  );
}
