"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedMs, setLockedMs] = useState<number | null>(null);
  const router = useRouter();

  const checkLock = useCallback(async () => {
    const res = await fetch("/api/admin/login");
    const data = await res.json() as { locked: boolean; remainingMs?: number };
    if (data.locked && data.remainingMs) {
      setLockedMs(data.remainingMs);
    } else {
      setLockedMs(null);
    }
  }, []);

  useEffect(() => {
    checkLock();
  }, [checkLock]);

  useEffect(() => {
    if (lockedMs === null || lockedMs <= 0) return;
    const timer = setInterval(() => {
      setLockedMs(prev => {
        if (prev === null || prev <= 1000) {
          clearInterval(timer);
          setError("");
          return null;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockedMs]);

  const handleLogin = async () => {
    if (!password || lockedMs !== null) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json() as { error?: string };
        const msg = data.error || "비밀번호 틀렸어";
        setError(msg);
        if (res.status === 429) {
          await checkLock();
        }
      }
    } catch {
      setError("오류 발생");
    }
    setLoading(false);
  };

  const remainingSec = lockedMs !== null ? Math.ceil(lockedMs / 1000) : null;
  const isLocked = lockedMs !== null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 24, color: "#e8e8f0", fontWeight: 600, marginBottom: 6 }}>
            Admin
          </div>
          <div style={{ fontSize: 13, color: "#555" }}>lynn&apos;s blog</div>
        </div>

        {isLocked ? (
          <div style={{
            background: "#1a1a2e",
            border: "1px solid #3a2a2a",
            borderRadius: 12,
            padding: "20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
            <div style={{ color: "#ff8080", fontSize: 14, marginBottom: 4 }}>로그인 잠김</div>
            <div style={{ color: "#888", fontSize: 13 }}>
              {remainingSec}초 후에 다시 시도할 수 있어
            </div>
          </div>
        ) : (
          <>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="비밀번호"
                autoFocus
                style={{
                  width: "100%",
                  background: "#13131e",
                  border: "1px solid #2a2a3e",
                  borderRadius: 12,
                  color: "#e8e8f0",
                  fontSize: 16,
                  padding: "14px 44px 14px 16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16,
                }}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>

            {error && (
              <div style={{ color: "#ff8080", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !password}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: loading ? "#2a2a3e" : "#a8f0d8",
                color: loading ? "#888" : "#0a0a0f",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "확인 중..." : "들어가기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
