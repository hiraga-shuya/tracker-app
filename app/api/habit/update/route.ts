import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { unlockAchievement } from "@/lib/unlockAchievement";

export async function POST(req: Request) {
  const userId = await getUserId(); //cookieStoreからユーザーIDを取得

  if (!userId) {
    // ユーザーIDが空だった場合、401を返す
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json(); // apiにPOST送信されたjson形式の内容をbody変数の中に格納。

  const id = typeof body.id === "string" ? body.id : ""; //idの値をstring型でid変数に格納。空だった場合は""で格納
  const name = typeof body.name === "string" ? body.name : ""; // nameの値をstring型でname変数に格納。空だった場合は""で格納
  const icon_type =
    typeof body.icon_type === "string" ? body.icon_type : "book"; // icon_typeの値をstring型でicon_type変数に格納。空だった場合はbookで格納

  const is_active = body.is_active === true || body.is_active === "true"; // is_activeの値をboolean型で、trueならtrueで格納。boolean型なので、それ以外ならfalseで指定される

  if (!id) {
    // idが空っぽだったら400を返す
    return new Response("ID is required", { status: 400 });
  }

  if (!name || name.trim() === "") {
    // nameをtrimした結果、空っぽだったら400を返す
    return new Response("Name is required", { status: 400 });
  }

  // =========================
  // 更新処理
  // =========================
  const result = await prisma.habit_Task.updateMany({
    where: {
      id,
      userId,
    }, // idとuserIdが合致するhabit_taskのレコードを絞り込む
    data: {
      name: name.trim(),
      icon_type,
      is_active,
    }, // 絞り込んだhabit_taskに対し、name / icon_type / is_activeの値を更新する
  });

  if (result.count === 0) {
    // whereで絞り込んだ結果、0件だった場合は404を返す
    return new Response("Not found", { status: 404 });
  }

  // =========================
  // 🏆 実績処理（統一版）
  // =========================
  const unlockedAchievements = await Promise.all([
    unlockAchievement(userId, "first_name_change"),
    unlockAchievement(userId, "first_image_change"),
  ]).then((results) => results.flat());
  // 実績が取得されるかの条件判定 + 取得される場合は実績解除の付与の処理を呼び出している

  // =========================
  // レスポンス
  // =========================
  return Response.json(
    {
      success: true,
      unlockedAchievements,
    },
    { status: 200 },
  );
}
