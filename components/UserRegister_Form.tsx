"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRegister_Form() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    const trimmed = name.trim();

    if (!trimmed) {
      alert("名前を入力してください");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        throw new Error("failed");
      }

      router.refresh();
    } catch (e) {
      console.error(e);
      alert("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-panel max-w-[500px]">
      <div className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          placeholder="お名前を入力"
          className="game-input"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="game-button whitespace-nowrap"
          style={{
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "登録中..." : "はじめる"}
        </button>
      </div>
    </div>
  );
}
