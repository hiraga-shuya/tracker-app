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
      return;
    }

    // 重複除去（keyベース）
    const merged = [...current, ...achievements];

    const unique = Array.from(new Map(merged.map((a) => [a.key, a])).values());

    sessionStorage.setItem("achievement_unlock", JSON.stringify(unique));
  } catch (e) {
    console.error("toast error:", e);

    // フォールバック
    sessionStorage.setItem("achievement_unlock", JSON.stringify(achievements));
  }
}
