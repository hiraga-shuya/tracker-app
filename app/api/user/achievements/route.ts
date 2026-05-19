// ユーザーが達成済みの実績一覧を取得するAPI
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

export async function GET() {
  // フロント側からこのAPIに対してGET通信が合ったら発火
  try {
    const userId = await getUserId(); //cookieStoreからユーザーIDを取得

    if (!userId) {
      // ユーザーIDが空だった場合は401を返す
      return Response.json([], { status: 401 });
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId }, //userAchievementテーブルから、今ログインしているユーザーの実績一覧だけ絞り込んで、userAchievements変数に格納
    });

    const keys = userAchievements.map((a) => a.achievementKey); // userAchievements（配列）の各要素から achievementKey プロパティだけを取り出して、新しい配列を作っている

    const achievements = await prisma.achievement.findMany({
      where: {
        key: {
          in: keys, //keysで絞り込んだ、今ログイン中のユーザーが達成したアチーブメントのkeyが合致するものを検索し、achievements変数に格納している（ユーザーが達成済みの実績マスタをまとめて取得）
        },
      },
    });

    const result = achievements.map((a) => ({
      id: a.id,
      key: a.key,
      title: a.title,
    })); // result変数にフロント側で使用する値のみを格納

    return Response.json(result); //今回、達成処理を行うアチーブメントについて、json形式でレスポンスを返す
  } catch (e) {
    console.error("ACHIEVEMENT API ERROR:", e); // tryのどこかでエラーが合ったらエラー文を表示
    return Response.json([], { status: 500 }); // サーバーエラー時は空配列を返す
  }
}
