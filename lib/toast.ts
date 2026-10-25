// ユーザーの状態（実績数・レベル・名前・画像など）が変わったことを知らせるイベント名。
// ヘッダーのステータス表示（HeaderStatus）がこのイベントを受けて表示を取り直す。
export const USER_STATUS_CHANGED_EVENT = "user-status-changed";

// 状態変化を通知する。実績を解除したとき以外（ユーザー登録直後など）にも使う。
export function notifyUserStatusChanged() {
  window.dispatchEvent(new Event(USER_STATUS_CHANGED_EVENT));
}

export function pushAchievement(achievements: any[]) {
  if (!Array.isArray(achievements) || achievements.length === 0) return;

  try {
    const raw = sessionStorage.getItem("achievement_unlock");

    const current = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(current)) {
      sessionStorage.setItem(
        "achievement_unlock",
        JSON.stringify(achievements),
      );
      notifyUserStatusChanged();
      return;
    }

    // 重複除去（keyベース）
    const merged = [...current, ...achievements];

    const unique = Array.from(new Map(merged.map((a) => [a.key, a])).values());

    sessionStorage.setItem("achievement_unlock", JSON.stringify(unique));

    // 実績が増えた＝レベル等も変わるので、ヘッダー表示の最新化を促す
    notifyUserStatusChanged();
  } catch (e) {
    console.error("toast error:", e);

    // フォールバック
    sessionStorage.setItem("achievement_unlock", JSON.stringify(achievements));
    notifyUserStatusChanged();
  }
}
