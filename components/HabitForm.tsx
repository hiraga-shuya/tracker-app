"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import IconSelectModal from "@/components/IconSelectModal";

type Props = {
  mode: "create" | "edit";
  initial?: {
    id?: string;
    name?: string;
    icon_type?: string;
    is_active?: boolean;
  };
};

export default function HabitForm({ mode, initial }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [iconType, setIconType] = useState(initial?.icon_type ?? "book");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;

    const trimmed = name.trim();
    if (!trimmed) {
      alert("名前を入力してください");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id: initial?.id,
        name: trimmed,
        icon_type: iconType,
        is_active: isActive,
      };

      const url = mode === "edit" ? "/api/habit/update" : "/api/habit";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("request failed");

      const data = await res.json();

      const achievements = data.unlockedAchievements ?? [];

      console.log("🔥 HABIT FORM DEBUG");
      console.log("API response:", data);
      console.log("achievements:", achievements);

      // =========================
      // Toast統一
      // =========================
      if (achievements.length > 0) {
        sessionStorage.setItem(
          "achievement_unlock",
          JSON.stringify(achievements),
        );
      }

      router.push(mode === "edit" ? "/habit" : "/");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-panel space-y-6">
      {/* 名前入力 */}
      <section>
        <p className="mb-2 text-sm font-bold tracking-widest">QUEST NAME</p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="毎日読書する"
          disabled={loading}
          className="game-input"
        />
      </section>

      {/* アイコン */}
      <section>
        <p className="mb-3 text-sm font-bold tracking-widest">QUEST ICON</p>

        <div className="border-4 border-black bg-[#fff] p-4">
          <IconSelectModal value={iconType} onChange={setIconType} />
        </div>
      </section>

      {/* 状態 */}
      <section>
        <p className="mb-3 text-sm font-bold tracking-widest">STATUS</p>

        <div className="flex gap-4 flex-wrap">
          <label
            className={`
              border-4 border-black px-4 py-2 font-bold cursor-pointer
              transition-all
              ${isActive ? "bg-[#c8e6c9]" : "bg-white"}
            `}
          >
            <input
              type="radio"
              checked={isActive === true}
              onChange={() => setIsActive(true)}
              className="hidden"
            />
            ✅ 有効
          </label>

          <label
            className={`
              border-4 border-black px-4 py-2 font-bold cursor-pointer
              transition-all
              ${!isActive ? "bg-[#ffcdd2]" : "bg-white"}
            `}
          >
            <input
              type="radio"
              checked={isActive === false}
              onChange={() => setIsActive(false)}
              className="hidden"
            />
            ⛔ 無効
          </label>
        </div>
      </section>

      {/* 送信 */}
      <section>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="game-button w-full text-xl"
        >
          {loading
            ? "処理中..."
            : mode === "edit"
              ? "クエスト更新"
              : "クエスト追加"}
        </button>
      </section>
    </div>
  );
}
