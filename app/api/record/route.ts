import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { unlockAchievement } from "@/lib/unlockAchievement";

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

  const today = new Date(); // 今日の日時をtoday変数に格納
  today.setHours(0, 0, 0, 0); // 日付単位で条件判定を行えるデータで登録するため、時刻を0,0,0,0にセット

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
  const unlockedAchievements = await Promise.all([
    unlockAchievement(userId, "first_habit_done"), // 初めて習慣タスクを達成した。という実績が達成される可能性があるため、セット。
  ]).then((results) => results.flat());
  // 実績解除の可能性があるアチーブメントをセットし、unlockedAchievementsに渡す。

  return Response.json({
    success: true,
    unlockedAchievements,
  });
}
