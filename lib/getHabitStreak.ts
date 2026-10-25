import {
  getJstTodayKey,
  shiftJstDateKey,
  toJstDateKey,
} from "@/lib/date";

type HabitRecord = {
  date: Date;
};

export function getHabitStreak(records: HabitRecord[]) {
  // 記録された日を、日本時間の日付キー（YYYY-MM-DD）の集合にする
  const recordedDays = new Set(
    records.map((record) => toJstDateKey(new Date(record.date))),
  );

  const todayKey = getJstTodayKey();

  // 今日まだ記録していない場合は、昨日を起点に遡って数える。
  // （今日記録していないだけで、継続が途切れた扱いにしない）
  let cursor = recordedDays.has(todayKey)
    ? todayKey
    : shiftJstDateKey(todayKey, -1);

  let streak = 0;

  while (recordedDays.has(cursor)) {
    streak++;
    cursor = shiftJstDateKey(cursor, -1);
  }

  return streak;
}
