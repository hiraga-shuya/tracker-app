// ヘッダー表示用の、ユーザーの最新状態を返すAPI。
// レイアウトは画面遷移のたびには再描画されないため、ヘッダーの
// 名前・画像・レベルはクライアント側からこのAPIで取り直して最新化する。
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { getLevelInfo } from "@/lib/level";

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    // 未登録のときはゲスト表示用の初期値を返す
    const levelInfo = getLevelInfo(0);

    return Response.json({
      name: "ゲスト",
      image: null,
      unlockedCount: 0,
      level: levelInfo.level,
      title: levelInfo.title,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const unlockedCount = await prisma.userAchievement.count({
    where: { userId },
  });

  const levelInfo = getLevelInfo(unlockedCount);

  return Response.json({
    name: user?.name ?? "ゲスト",
    image: user?.image ?? null,
    unlockedCount,
    level: levelInfo.level,
    title: levelInfo.title,
  });
}
