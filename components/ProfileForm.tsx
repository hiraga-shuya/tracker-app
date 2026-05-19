"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialName: string;
  initialImage: string;
};

type Achievement = {
  id: string;
  key: string;
  title: string;
};

export default function ProfileForm({ initialName, initialImage }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImage || null);

  // =========================
  // 🏆 実績状態
  // =========================
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // =========================
  // 🏆 実績取得
  // =========================
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch("/api/user/achievements");
        const data = await res.json();

        console.log("🔥 ACHIEVEMENTS DEBUG:", data);

        setAchievements(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchAchievements();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    setImageFile(file);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", name);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/user/update", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log("APIエラー:", errorData);
        alert(JSON.stringify(errorData));
        throw new Error("保存失敗");
      }

      const data = await res.json();

      const unlocked = data.unlockedAchievements ?? [];

      console.log("🔥 PROFILE DEBUG");
      console.log("API response:", data);
      console.log("achievements:", unlocked);

      if (unlocked.length > 0) {
        sessionStorage.setItem("achievement_unlock", JSON.stringify(unlocked));
      }

      router.refresh();
      alert("保存しました！");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* アバター */}
      <div className="game-panel flex flex-col items-center gap-4">
        <div className="w-24 h-24 border-4 border-black bg-[#f5f5f5] rounded-full overflow-hidden flex items-center justify-center shadow-[4px_4px_0_0_#000]">
          {preview ? (
            <img
              src={preview}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500">NO IMAGE</span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="avatar-upload"
        />

        <label htmlFor="avatar-upload" className="game-button cursor-pointer">
          アバター変更
        </label>
      </div>

      {/* 名前 */}
      <div className="game-panel">
        <p className="text-xs text-gray-500 mb-2">PLAYER NAME</p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前を入力"
          className="w-full border-4 border-black px-3 py-2 font-bold"
        />
      </div>

      {/* =========================
          🏆 称号（ここが完成）
      ========================= */}
      <div className="game-panel">
        <p className="text-xs text-gray-500 mb-2">ACHIEVEMENTS</p>

        <div className="max-h-48 overflow-y-auto space-y-2">
          {achievements.length === 0 ? (
            <p className="text-xs text-gray-400">まだ称号がありません</p>
          ) : (
            achievements.map((a) => (
              <div
                key={a.id}
                className="border-2 border-black bg-white px-3 py-2 flex items-center gap-2"
              >
                <span>🏆</span>
                <span className="text-sm font-bold">{a.title}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 保存 */}
      <button onClick={handleSave} className="game-button w-full text-lg">
        SAVE
      </button>
    </div>
  );
}
