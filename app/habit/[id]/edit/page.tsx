import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { getHabitStreak } from "@/lib/getHabitStreak";

import HabitForm from "@/components/HabitForm";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic"; // キャッシュされないように、このページは毎回サーバーで再生成して！の指示

export default async function EditHabitPage({
  params, //Next.jsからURLパラメータ(params)を受け取る
}: {
  params: Promise<{ id: string }>; //URLのパラメータの値から、idプロパティをstring型として定義
}) {
  const id = (await params).id; // paramsが取得できたのち、idプロパティを抜き出して、id変数に格納

  const userId = await getUserId(); // cookieStoreからuserIdを取得

  if (!userId) {
    // userIdが空だった場合、エラー文を表示する
    return <div>ユーザーIDが取得出来なかったよ！</div>;
  }

  const habit = await prisma.habit_Task.findFirst({
    where: {
      id, //paramsから取得した習慣タスクのidと合致するもの、
      userId, //cookieStoreから取得したユーザーIDと合致するもの、
      deleted_at: null, //かつ、削除状態がnullになっているもの（編集画面では、この絞り込みいらなくないか？？）
    },
    include: {
      records: {
        orderBy: { date: "desc" }, //レコードを新しい順に表示
      },
    },
  });

  if (!habit) {
    // 該当の習慣タスクが見つからなかった場合にエラー文を表示
    return <div>該当の習慣タスクが見つかりません</div>;
  }

  // 連続達成日数を計算するために、計算用ロジックのlibに対して、habit.recordsを渡している
  const streak = getHabitStreak(habit.records);

  return (
    <div className="max-w-3xl mx-auto">
      {/* タイトルエリア */}
      <div className="game-panel mb-6">
        <p className="text-sm tracking-[0.2em] text-gray-500 mb-2">
          HABIT EDIT
        </p>

        <h1 className="text-4xl font-black mb-3">習慣タスク編集</h1>

        <p className="text-gray-700 leading-relaxed">
          習慣の内容や状態を変更できます。
          <br />
          毎日の積み重ねを、自分好みに育てよう。
        </p>
      </div>

      {/* フォーム */}
      <div className="mb-6">
        <HabitForm mode="edit" initial={habit} />
      </div>

      {/* ステータス */}
      <div
        className="
          game-panel
          mb-6
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        "
      >
        {/* 合計回数 */}
        <div
          className="
            border-4 border-black
            bg-white
            p-4
          "
        >
          <p className="text-xs tracking-widest text-gray-500 mb-2">
            TOTAL CLEAR
          </p>

          <p className="text-4xl font-black">{habit.records.length}</p>

          <p className="mt-1 text-sm">合計達成回数</p>
        </div>

        {/* 連続達成 */}
        <div
          className="
            border-4 border-black
            bg-white
            p-4
          "
        >
          <p className="text-xs tracking-widest text-gray-500 mb-2">STREAK</p>

          <p className="text-4xl font-black">{streak}</p>

          <p className="mt-1 text-sm">連続達成日数</p>
        </div>
      </div>

      {/* 削除エリア */}
      <div className="game-panel bg-[#ffe5e5]">
        <p className="text-sm font-bold text-red-700 mb-4">
          ⚠ この習慣タスクを削除します
        </p>

        <DeleteButton id={habit.id} redirectTo="/habit/" />
      </div>
    </div>
  );
}
