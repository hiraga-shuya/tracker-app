"use client";

import { useEffect } from "react";

import { pushAchievement } from "@/lib/toast";

type Props = {
  // サーバー側（ページ表示時）で新しく解除された実績
  achievements: { key: string; title: string }[];
};

// ページ表示のタイミングで解除された実績を、既存のトースト表示につなぐための部品。
// 表示自体は AchievementToast が sessionStorage 経由で行う。
export default function AchievementNotifier({ achievements }: Props) {
  useEffect(() => {
    if (achievements.length > 0) {
      pushAchievement(achievements);
    }
    // 初回表示のときだけ通知したいので、依存配列は空にしている
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
