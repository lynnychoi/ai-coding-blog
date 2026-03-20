import React from "react";

export const COLORS = {
  bg: "#0a0a0f",
  bgCard: "#13131e",
  bgPrompt: "#0e0e1a",
  border: "#1a1a2e",
  borderCard: "#2a2a3e",
  borderPrompt: "#2a2a4a",
  text: "#e8e8f0",
  textMuted: "#555",
  textPrompt: "#9090c0",
  primary: "#c4b8f8",
  success: "#22c55e",
  error: "#ef4444",
};

export const COMMON: Record<string, React.CSSProperties> = {
  page:     { minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "0 0 80px" },
  top:      { position: "sticky", top: 0, zIndex: 30, background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 },
  back:     { fontSize: 13, color: COLORS.textMuted, textDecoration: "none" },
  section:  { padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}` },
  label:    { fontSize: 11, color: COLORS.textMuted, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 } as React.CSSProperties,
  input:    { width: "100%", background: COLORS.bgCard, border: `1px solid ${COLORS.borderCard}`, borderRadius: 8, color: COLORS.text, fontSize: 15, padding: "10px 12px", outline: "none", boxSizing: "border-box" } as React.CSSProperties,
  textarea: { width: "100%", background: COLORS.bgCard, border: `1px solid ${COLORS.borderCard}`, borderRadius: 8, color: COLORS.text, fontSize: 14, padding: "12px", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" } as React.CSSProperties,
  promptTA: { width: "100%", background: COLORS.bgPrompt, border: `1px dashed ${COLORS.borderPrompt}`, borderRadius: 8, color: COLORS.textPrompt, fontSize: 14, padding: "12px", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" } as React.CSSProperties,
  imageRow: { display: "flex", gap: 10, alignItems: "center", background: COLORS.bgCard, borderRadius: 8, padding: "10px 12px", marginBottom: 8 },
  smallBtn: { padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.borderCard}`, background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" },
  primaryBtn: { padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.primary, color: COLORS.bg, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  errorBox: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 8, padding: "10px 12px", color: "#ff8080", fontSize: 13 },
  successBox: { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 12px", color: "#4ade80", fontSize: 13, marginTop: 8 },
};
