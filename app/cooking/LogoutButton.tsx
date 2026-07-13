"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/cooking/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "none",
        border: "1px solid #2a2a3e",
        borderRadius: 8,
        color: "#555",
        fontSize: 13,
        padding: "6px 12px",
        cursor: "pointer",
      }}
    >
      로그아웃
    </button>
  );
}
