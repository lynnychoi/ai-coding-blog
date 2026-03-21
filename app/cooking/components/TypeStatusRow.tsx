"use client";

interface TypeStatusRowProps {
  type: "dev" | "writing";
  onTypeChange: (val: "dev" | "writing") => void;
  status: "published" | "unpublished";
  onStatusChange: (val: "published" | "unpublished") => void;
}

const btn = (active: boolean, color?: string): React.CSSProperties => ({
  flex: 1,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: active ? 700 : 400,
  background: active ? (color ?? "#3b3b6e") : "#13131e",
  color: active ? "#c4b8f8" : "#555",
});

export default function TypeStatusRow({ type, onTypeChange, status, onStatusChange }: TypeStatusRowProps) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: 1, display: "block", marginBottom: 6 }}>타입</label>
        <div style={{ display: "flex", gap: 6, height: 38 }}>
          {(["dev", "writing"] as const).map(t => (
            <button key={t} onClick={() => onTypeChange(t)} style={btn(type === t)}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: 1, display: "block", marginBottom: 6 }}>공개여부</label>
        <div style={{ display: "flex", gap: 6, height: 38 }}>
          {([["published", "공개", "#1a2e1a", "#86efac"], ["unpublished", "비공개", "#2a1a3e", "#c084fc"]] as const).map(([val, label, bg, fg]) => (
            <button key={val} onClick={() => onStatusChange(val)}
              style={{ ...btn(status === val), background: status === val ? bg : "#13131e", color: status === val ? fg : "#555", fontSize: 12 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
