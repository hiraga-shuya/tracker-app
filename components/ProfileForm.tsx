"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { notifyUserStatusChanged, pushAchievement } from "@/lib/toast";

import RecoveryCode from "@/components/RecoveryCode";

type Props = {
  initialName: string;
  initialImage?: string | null;
  // 達成済みの実績一覧（サーバー側で取得して渡す。保存後の再描画で自動で最新になる）
  initialAchievements: Achievement[];
  // 復旧コード（ユーザーID）。別環境からデータを引き継ぐときに使う
  recoveryCode: string;
};

type Achievement = {
  id: string;
  key: string;
  title: string;
};

export default function ProfileForm({
  initialName,
  initialImage,
  initialAchievements,
  recoveryCode,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialName);

  // =========================
  // 🖼️ プロフィール画像の状態
  // =========================
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 画像が選ばれたら、保存前でもプレビューで確認できるようにする
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const formData = new FormData();

      formData.append("name", name);

      // 画像が選ばれていれば一緒に送る（選ばれていなければ今の画像のまま）
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
        // トースト表示＋ヘッダーのステータス最新化（pushAchievement が両方を行う）
        pushAchievement(unlocked);
      }

      // 名前や画像だけの変更でも、ヘッダー表示を最新化する
      notifyUserStatusChanged();

      router.refresh();
      alert("保存しました！");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* アバター */}
      <div className="game-panel flex flex-col items-center gap-4">
        <div className="w-24 h-24 border-4 border-black bg-[#f5f5f5] rounded-full overflow-hidden flex items-center justify-center shadow-[4px_4px_0_0_#000]">
          <img
            src={imagePreview ?? initialImage ?? "/images/default.svg"}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 画像の選択（保存ボタンを押すまで反映されない） */}
        <label
          htmlFor="profile-image-input"
          className="border-4 border-black bg-white px-4 py-2 font-bold shadow-[4px_4px_0_0_#000] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] active:translate-y-[3px] active:shadow-none cursor-pointer"
        >
          🖼️ 画像を変更
        </label>

        <input
          id="profile-image-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <p className="text-xs text-gray-500">
          {imageFile
            ? `選択中： ${imageFile.name}（SAVEで反映されます）`
            : "画像を選んでSAVEを押すと、プロフィール画像が変わります（4MBまで）"}
        </p>
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
          {initialAchievements.length === 0 ? (
            <p className="text-xs text-gray-400">まだ称号がありません</p>
          ) : (
            initialAchievements.map((a) => (
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
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="game-button w-full text-lg disabled:opacity-50"
      >
        {isSaving ? "保存中..." : "SAVE"}
      </button>

      {/* 復旧コード */}
      <RecoveryCode code={recoveryCode} />
    </div>
  );
}
