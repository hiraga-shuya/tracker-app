"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { notifyUserStatusChanged } from "@/lib/toast";

export default function UserRegister_Form() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // 復旧コードでの再開用
  const [recoveryCode, setRecoveryCode] = useState("");
  const [restoring, setRestoring] = useState(false);

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

      // ヘッダーの表示（ゲスト→登録した名前・レベル）も最新化する
      notifyUserStatusChanged();
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 復旧コードを入力すると、以前のデータを引き継いで再開できる
  const handleRestore = async () => {
    if (restoring) return;

    const code = recoveryCode.trim();

    if (!code) {
      alert("復旧コードを入力してください");
      return;
    }

    setRestoring(true);

    try {
      const res = await fetch("/api/user/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "復旧に失敗しました");
      }

      // ヘッダーの表示も最新化する
      notifyUserStatusChanged();
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "復旧に失敗しました");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* すでに登録済みの人向け：復旧コードで再開する */}
      <div className="game-panel max-w-[500px]">
        <p className="text-xs text-gray-500 mb-2">すでに登録済みの方</p>

        <p className="text-sm mb-3">
          復旧コードを入力すると、今までの記録を引き継いで再開できます。
        </p>

        <div className="flex gap-3">
          <input
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            disabled={restoring}
            placeholder="復旧コードを入力"
            className="game-input"
          />

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="game-button whitespace-nowrap"
            style={{
              opacity: restoring ? 0.5 : 1,
            }}
          >
            {restoring ? "確認中..." : "復旧する"}
          </button>
        </div>
      </div>
    </div>
  );
}
