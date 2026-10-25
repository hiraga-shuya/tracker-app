import { prisma } from "@/lib/prisma";
import { unlockAchievement } from "@/lib/unlockAchievement";
import { getHabitStreak } from "@/lib/getHabitStreak";

// 実績のしきい値（prisma/seed.ts の実績キーと対応させる）
const STREAK_THRESHOLDS = [3, 5, 7, 14, 30]; // streak_3, streak_5, ...
const TOTAL_THRESHOLDS = [20, 50, 100, 200, 300]; // total_20, total_50, ...
const CATEGORY_THRESHOLDS = [1, 10, 20, 50]; // 例： sport_1, sport_10, ...

type Counts = {
  streak: number; // この習慣の連続日数
  totalCount: number; // ユーザーの全習慣の記録数
  categoryCount: number; // この習慣と同じカテゴリの記録数
  iconType: string; // カテゴリ（icon_type）
};

// 現在の数値から、条件を満たした実績キーの一覧を組み立てる
export function recordAchievementKeys({
  streak,
  totalCount,
  categoryCount,
  iconType,
}: Counts) {
  const keys: string[] = [];

  for (const threshold of STREAK_THRESHOLDS) {
    if (streak >= threshold) keys.push(`streak_${threshold}`);
  }

  for (const threshold of TOTAL_THRESHOLDS) {
    if (totalCount >= threshold) keys.push(`total_${threshold}`);
  }

  for (const threshold of CATEGORY_THRESHOLDS) {
    if (categoryCount >= threshold) keys.push(`${iconType}_${threshold}`);
  }

  return keys;
}

// 習慣を記録したタイミングで呼ぶ。
// 連続日数・合計回数・カテゴリ別回数を数え直し、条件を満たした実績を解除する。
// すでに解除済みの実績は unlockAchievement 側で何もしないので、毎回まとめて判定してよい。
export async function checkRecordAchievements(
  userId: string,
  habit: { id: string; icon_type: string },
) {
  // この習慣の記録を全部取得して、連続日数を計算する
  const records = await prisma.habit_Record.findMany({
    where: { habit_task_id: habit.id },
    select: { date: true },
  });
  const streak = getHabitStreak(records);

  // ユーザーの全習慣の記録数
  const totalCount = await prisma.habit_Record.count({
    where: { habit_task: { userId } },
  });

  // この習慣と同じカテゴリの記録数
  const categoryCount = await prisma.habit_Record.count({
    where: { habit_task: { userId, icon_type: habit.icon_type } },
  });

  const keys = recordAchievementKeys({
    streak,
    totalCount,
    categoryCount,
    iconType: habit.icon_type,
  });

  const results = await Promise.all(
    keys.map((key) => unlockAchievement(userId, key)),
  );

  return results.flat();
}
