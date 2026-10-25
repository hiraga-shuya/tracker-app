// リマインダーの送信タイミング判定（日本時間ベース）。
// サーバー（Vercel）は UTC で動くため、日本時間は UTC+9 の固定オフセットで計算する
// （日本には夏時間がないので、この計算で常に正しくなる）。

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export type JstParts = {
  year: number;
  month: number; // 1〜12
  day: number; // 日
  weekday: number; // 0=日曜〜6=土曜
  hour: number; // 0〜23
  minute: number; // 0〜59
};

// UTC の日時を、日本時間の年月日・曜日・時分に分解する
export function getJstParts(now: Date): JstParts {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth() + 1,
    day: jst.getUTCDate(),
    weekday: jst.getUTCDay(),
    hour: jst.getUTCHours(),
    minute: jst.getUTCMinutes(),
  };
}

// 「その日本時間の日付の hour:minute」という予定日時を、UTC の Date で返す。
// lastSentAt にこの値を記録しておくことで、同じ予定への二重送信を防ぐ。
export function getScheduledInstant(
  parts: JstParts,
  hour: number,
  minute: number,
): Date {
  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute) -
      9 * 60 * 60 * 1000,
  );
}

type ReminderLike = {
  is_active: boolean;
  hour: number;
  minute: number;
  daysOfWeek: number[];
  lastSentAt: Date | null;
};

// 定期実行（数分おきに呼ばれる）のタイミングで、このリマインダーを送るべきか。
// 条件：有効である／今日が対象の曜日／予定時刻から windowMinutes 分以内／
// その予定日時ではまだ送っていない。
export function shouldSendReminder(
  reminder: ReminderLike,
  now: Date,
  windowMinutes = 10,
): boolean {
  if (!reminder.is_active) return false;

  const parts = getJstParts(now);

  if (!reminder.daysOfWeek.includes(parts.weekday)) return false;

  const currentMinutes = parts.hour * 60 + parts.minute;
  const scheduledMinutes = reminder.hour * 60 + reminder.minute;
  const diff = currentMinutes - scheduledMinutes;

  if (diff < 0 || diff >= windowMinutes) return false;

  const scheduledInstant = getScheduledInstant(
    parts,
    reminder.hour,
    reminder.minute,
  );

  if (
    reminder.lastSentAt &&
    reminder.lastSentAt.getTime() === scheduledInstant.getTime()
  ) {
    return false;
  }

  return true;
}
