import { prisma } from "@/lib/prisma";
import { unlockAchievement } from "@/lib/unlockAchievement";
import { getJstTodayKey, jstDateKeyToUtcDate } from "@/lib/date";

// 実績のしきい値（prisma/seed.ts の実績キーと対応させる）
const LOGIN_THRESHOLDS = [1, 5, 10, 15, 20, 30, 60]; // login_1, login_5, ...

// 起動日数から、条件を満たした実績キーの一覧を組み立てる
export function loginAchievementKeys(accessDays: number) {
  return LOGIN_THRESHOLDS.filter((threshold) => accessDays >= threshold).map(
    (threshold) => `login_${threshold}`,
  );
}

// アプリを開いた日を記録し、起動日数の実績を判定する。
// 「アプリを開いた日＝1日」として数え、同じ日に何度開いても1日分だけ数える。
// 今日の分がまだ無ければ1件追加する（upsert で @@unique 制約と合わせて二重登録を防ぐ）。
export async function checkLoginAchievements(userId: string) {
  const today = jstDateKeyToUtcDate(getJstTodayKey());

  await prisma.user_Access_Day.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    create: {
      userId,
      date: today,
    },
    update: {},
  });

  // これまでにアプリを開いた日の合計
  const accessDays = await prisma.user_Access_Day.count({
    where: { userId },
  });

  const keys = loginAchievementKeys(accessDays);

  const results = await Promise.all(
    keys.map((key) => unlockAchievement(userId, key)),
  );

  return results.flat();
}
