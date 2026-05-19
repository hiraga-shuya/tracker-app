"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TodayButton({ habitId }: { habitId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ habitId }),
      });

      if (!res.ok) {
        throw new Error("Failed to record");
      }

      // =========================
      // 🏆 実績データ取得
      // =========================
      const data = await res.json();

      console.log("🔥 RECORD DEBUG");
      console.log("API response:", data);

      // 安全に抽出
      const achievements = Array.isArray(data.unlockedAchievements)
        ? data.unlockedAchievements
        : [];

      if (achievements.length > 0) {
        sessionStorage.setItem(
          "achievement_unlock",
          JSON.stringify(achievements),
        );
      }

      router.refresh();
    } catch (e) {
      console.error(e);
      alert("記録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="game-button"
      style={{
        opacity: loading ? 0.5 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "記録中..." : "今日やった"}
    </button>
  );
}
