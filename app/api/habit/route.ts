import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { unlockAchievement } from "@/lib/unlockAchievement";

export async function POST(req: Request) {
  const userId = await getUserId(); // cookieStoreからユーザーIDを取得

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
    // ユーザーIDが空っぽだったら401を返す
  }

  const body = await req.json(); // フロント側からPOST通信で送られてきた内容をbody変数に格納

  const name = typeof body.name === "string" ? body.name : ""; // nameの値をstring型にして格納。中身が空だった場合は""で格納
  const icon_type =
    typeof body.icon_type === "string" ? body.icon_type : "book"; //icon_typeの値をstring型にして格納。中身が空だった場合はbookで格納

  const is_active =
    body.is_active === undefined //is_activeの中身がundefinedかを判定
      ? true //undefinedだった場合はis_activeの変数にtrueを格納
      : body.is_active === true || body.is_active === "true"; // trueと入っていた場合はtrueを格納。
  // 補足。is_activeにfalseが入っていた場合以外は、trueが入るようになっている

  if (!name.trim()) {
    // nameが空だった場合は400を返す
    return new Response("Name is required", {
      status: 400,
    });
  }

  // =========================
  // 作成処理
  // =========================
  await prisma.habit_Task.create({
    data: {
      name: name.trim(),
      userId,
      icon_type,
      is_active,
    }, // Habit_Taskテーブルにname / userId / icon_type / is_activeの値が入ったレコードを登録
  });

  // =========================
  // 🏆 実績（統一版）
  // =========================
  const unlockedAchievements = await Promise.all([
    unlockAchievement(userId, "first_habit_create"),
  ]).then((results) => results.flat());
  // first_habit_createの実績達成の可能性があるため、unlockAchievementを呼び出している

  // =========================
  // レスポンス
  // =========================
  return Response.json(
    {
      success: true,
      unlockedAchievements, //実績達成していた場合は、その状態をフロント側に渡す
    },
    {
      status: 201,
    },
  );
}
