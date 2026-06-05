import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { unlockAchievement } from "@/lib/unlockAchievement";

export async function POST(req: Request) {
  try {
    const userId = await getUserId(); // cookieStoreからユーザーIDを取得

    if (!userId) {
      return Response.json(
        // cookieStoreから取得したユーザーIDが空だった場合、エラー文と401を返す
        { error: "ユーザーが存在しません" },
        { status: 401 },
      );
    }

    const formData = await req.formData(); // プロフィール更新のため、formDataで送られてきた内容を取得。
    const name = formData.get("name") as string; // formDataからnameの値をstring型で取得

    const updateData = {
      name,
    };

    await prisma.user.update({
      where: { id: userId }, // 今回更新するユーザーIDのUserのデータを絞り込む。
      data: updateData, // updateDataに格納されたdataを更新
    });

    // =========================
    // 🏆 実績（統一版）
    // =========================
    const unlockedAchievements = await Promise.all([
      // この操作で解除される可能性がある実績を発火。
      unlockAchievement(userId, "first_name_change"), // 初めて名前を変更した　実績が解除される可能性があるので宣言
    ]).then((results) => results.flat());

    return Response.json({
      success: true,
      unlockedAchievements,
    });
  } catch (e) {
    // try内でエラーがあった場合、エラー文とともに500を返す
    console.error(e);
    return Response.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
