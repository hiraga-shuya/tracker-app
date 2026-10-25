// 日付の基準は日本時間（Asia/Tokyo）に統一する。
// サーバーのローカル時刻に依存すると、デプロイ先の地域設定で
// 「今日」の境界がずれてしまうため、ここに集約する。

const TIME_ZONE = "Asia/Tokyo";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Date を日本時間での日付キー（YYYY-MM-DD）に変換する
export function toJstDateKey(date: Date): string {
  return dateKeyFormatter.format(date);
}

// 日本時間での「今日」の日付キーを返す
export function getJstTodayKey(): string {
  return toJstDateKey(new Date());
}

// 日付キーが表す日本時間の0時を、UTCの Date として返す（記録の保存用）
// JST の0時は UTC では前日の15時のため、9時間引く
export function jstDateKeyToUtcDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) - 9 * 60 * 60 * 1000);
}

// 日付キーを指定日数ずらした日付キーを返す
export function shiftJstDateKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
