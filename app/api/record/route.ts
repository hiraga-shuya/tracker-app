import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { unlockAchievement } from "@/lib/unlockAchievement";
import { checkRecordAchievements } from "@/lib/checkRecordAchievements";
import { getJstTodayKey, jstDateKeyToUtcDate } from "@/lib/date";

export async function POST(req: Request) {
  const userId = await getUserId(); // cookieStoreからユーザーIDを取得

  if (!userId) {
    // ユーザーIDが空だった場合、401を返す
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json(); // POST通信で送られてきた内容をbody変数に格納
  const habitId = body.habitId; // 習慣タスクIDだけ、habitId変数に抽出して格納

  if (!habitId) {
    // 習慣タスクIDが空だった場合、400を返す
    return new Response("habitId is required", { status: 400 });
  }

  const habit = await prisma.habit_Task.findFirst({
    where: {
      id: habitId,
      userId,
      deleted_at: null,
    }, // このユーザーが所有していて、削除されていない特定の習慣タスクを取得
  });

  if (!habit) {
    // 絞り込んだ結果、空だった場合は404を返す
    return new Response("Not found", { status: 404 });
  }

  // 「今日」は日本時間で判定し、その日の0時（JST）を表す日時で登録する
  const today = jstDateKeyToUtcDate(getJstTodayKey());

  try {
    await prisma.habit_Record.create({
      data: {
        habit_task_id: habitId,
        date: today,
      }, // 今日、指定のタスクを達成したことを登録。（habit_Recordの新規レコードを登録。）
    });
  } catch {
    // DB側の制約で弾かれた場合、409を返す
    return new Response("Already recorded", { status: 409 });
  }

  // =========================
  // 🏆 実績（統一版）
  // =========================
  const unlockedAchievements = [
    // 初めて習慣タスクを達成した。という実績が達成される可能性があるため、セット。
    ...(await unlockAchievement(userId, "first_habit_done")),
    // 連続日数・合計回数・カテゴリ別回数の実績も、記録のたびにまとめて判定する
    ...(await checkRecordAchievements(userId, habit)),
  ];

  return Response.json({
    success: true,
    unlockedAchievements,
  });
}
