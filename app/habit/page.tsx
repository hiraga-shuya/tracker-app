import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { getHabitStreak } from "@/lib/getHabitStreak";

import HabitSortSelect from "@/components/HabitSortSelect";

import { habitIcons } from "@/src/constants/habitIcons";

export default async function Habit({
  searchParams, //Next.jsからURLクエリパラメータ(searchParams)を受け取る
}: {
  searchParams: Promise<{ sort?: string }>; //URLのクエリパラメータの値が入っていれば、sortプロパティの値をstring型で定義。
}) {
  const params = await searchParams; //searchParamsの値が取得されたら、params変数に格納
  const sort = params.sort ?? "new"; // 並び順について、選択された値をsort変数に格納。値がなければnewをセット。
  const userId = await getUserId(); // cookieStoreからuserIdを取得

  const habits = await prisma.habit_Task.findMany({
    where: {
      userId,
      deleted_at: null,
    },
    orderBy: sort === "old" ? { created_at: "asc" } : { created_at: "desc" }, // sort変数の中身が「old」であれば並び順を古い順に。違ったら最新順にする

    include: {
      records: true, //recordsテーブルの関連データも同時取得
    },
  });

  const sortedHabits =
    sort === "count" //sort変数が「count」になっているかをチェック
      ? [...habits].sort((a, b) => b.records.length - a.records.length) //元のhabits配列を破壊しないためコピーしつつ、countになってるなら、達成回数順にする
      : habits; //なってないなら、habits変数の中身をsortedHabitsに代入する

  return (
    <div className="space-y-6">
      {/* タイトルエリア */}
      <section className="game-panel">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm tracking-widest text-gray-600">QUEST MENU</p>

            <h1 className="text-2xl font-bold sm:text-3xl">習慣クエスト一覧</h1>
          </div>

          <Link href="/habit/new" className="game-button inline-block">
            ＋ 習慣を追加
          </Link>
        </div>
      </section>

      {/* 並び替え */}
      <section className="game-panel">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="font-bold">並び替え</p>

          <HabitSortSelect />
        </div>
      </section>

      {/* 習慣一覧 */}
      <ul className="space-y-5">
        {sortedHabits.map((habit) => {
          const streak = getHabitStreak(habit.records);
          
          const iconData =
          habitIcons[habit.icon_type as keyof typeof habitIcons] ??
          habitIcons.book;

          return (
            <li
              key={habit.id}
              className="
                    game-panel
                    transition-all
                    hover:-translate-y-1
                  "
            >
              <div className="flex items-start justify-between gap-3 flex-wrap sm:gap-4">
                {/* 左側 */}
                <div className="flex gap-3 sm:gap-4">
                  <figure
                    className="
                          w-12 h-12 sm:w-16 sm:h-16
                          border-4 border-black
                          bg-white
                          flex items-center justify-center
                          shrink-0
                        "
                  >
                    <Image
                      src={iconData.src}
                      alt={iconData.label}
                      width={36}
                      height={36}
                      className="h-7 w-7 sm:h-9 sm:w-9"
                    />
                  </figure>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">QUEST</p>

                      <h2 className="text-xl font-bold sm:text-2xl">{habit.name}</h2>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <div
                        className={`
                              border-2 border-black
                              px-2 py-0.5 sm:px-3 sm:py-1
                              text-xs font-bold sm:text-sm
                              ${habit.is_active ? "bg-[#fff9c4]" : "bg-[#e0e0e0] text-gray-600"}
                            `}
                      >
                        {habit.is_active ? "🟢 有効" : "⚪ 無効"}
                      </div>

                      <div
                        className="
                              border-2 border-black
                              bg-[#dcedc8]
                              px-2 py-0.5 sm:px-3 sm:py-1
                              text-xs font-bold sm:text-sm
                            "
                      >
                        🔥 {streak}日継続中
                      </div>

                      <div
                        className="
                              border-2 border-black
                              bg-[#bbdefb]
                              px-2 py-0.5 sm:px-3 sm:py-1
                              text-xs font-bold sm:text-sm
                            "
                      >
                        ✅ 達成回数 {habit.records.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右側ボタン */}
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href={`/habit/${habit.id}/calendar`}
                    className="game-button"
                  >
                    カレンダー
                  </Link>

                  <Link
                    href={`/habit/${habit.id}/edit`}
                    className="game-button"
                  >
                    編集
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
