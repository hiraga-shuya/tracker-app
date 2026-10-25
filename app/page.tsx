import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { getHabitStreak } from "@/lib/getHabitStreak";
import { checkLoginAchievements } from "@/lib/checkLoginAchievements";
import { getJstTodayKey, toJstDateKey } from "@/lib/date";

import { habitIcons } from "@/src/constants/habitIcons";
import { randomMessages } from "@/src/constants/messages";

import TodayButton from "@/components/TodayButton";
import DeleteButton from "@/components/DeleteButton";
import UserRegister from "@/components/UserRegister";
import AchievementNotifier from "@/components/AchievementNotifier";

export default async function Home() {
  const userId = await getUserId();
  if (!userId) {
    //userIdが空なら、ユーザー登録画面を表示
    return <UserRegister />;
  }

  const todayKey = getJstTodayKey(); // 「今日」は日本時間の日付で判定する

  // アプリを開いた日を記録し、起動日数の実績を判定する（今日すでに記録済みなら何も起きない）
  const loginUnlocked = await checkLoginAchievements(userId);

  //🌟 一覧表示用の元データをhabits変数に格納
  const habits = await prisma.habit_Task.findMany({
    where: {
      userId, //userIdが合致する、
      deleted_at: null, // 論理削除されていない、
      is_active: true, // 有効化されている習慣タスク、を絞り込み検索
    },
    include: {
      records: {
        orderBy: {
          date: "desc", //最新順に並べる
        },
      },
    },
  });

  //🌟 ランダムメッセージを取得
  const randomMessage =
    randomMessages[Math.floor(Math.random() * randomMessages.length)]; //「0~0.999...のランダム値×メッセージの配列の要素数 = ランダムな整数を作り、その番号のメッセージを取得」

  return (
    <div className="space-y-4 pb-28 sm:space-y-6">
      {/* 起動日数の実績が解除されたらトーストで知らせる */}
      <AchievementNotifier
        achievements={loginUnlocked.map((a) => ({ key: a.key, title: a.title }))}
      />

      {/* タイトル */}
      <section className="game-panel">
        <p className="text-sm tracking-widest text-gray-600">DAILY QUEST</p>

        <h1 className="text-2xl font-bold mb-2 sm:text-3xl sm:mb-3">習慣化がんばるくん</h1>

        <p className="text-sm opacity-80 leading-relaxed">{randomMessage}</p>
      </section>

      {/* 習慣一覧 */}
      <section className="space-y-5">
        {habits.map((habit) => {
          const doneToday = habit.records.some((record) => {
            return toJstDateKey(new Date(record.date)) === todayKey;
          });

          const streak = getHabitStreak(habit.records);
          const iconKey = habit.icon_type as keyof typeof habitIcons;
          const iconData = habitIcons[iconKey] ?? habitIcons.book;

          return (
            <div
              key={habit.id}
              className={`
                  game-panel
                  transition-all
                  hover:-translate-y-1
                `}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap sm:gap-4">
                {/* 左 */}
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
                      <p className="text-xs text-gray-500">ACTIVE QUEST</p>

                      <h2 className="text-xl font-bold sm:text-2xl">{habit.name}</h2>
                    </div>

                    {/* ステータスバッジ */}
                    <div className="flex gap-2 flex-wrap">
                      <div
                        className={`
                            border-2 border-black
                            px-2 py-0.5 sm:px-3 sm:py-1
                            text-xs font-bold sm:text-sm
                            ${doneToday ? "bg-[#c8e6c9]" : "bg-[#ffcdd2]"}
                          `}
                      >
                        {doneToday ? "✔ COMPLETE" : "⏳ IN PROGRESS"}
                      </div>

                      <div
                        className="
                            border-2 border-black
                            bg-[#bbdefb]
                            px-2 py-0.5 sm:px-3 sm:py-1
                            text-xs font-bold sm:text-sm
                          "
                      >
                        🔥 {streak}日継続中
                      </div>

                      <div
                        className="
                            border-2 border-black
                            bg-[#dcedc8]
                            px-2 py-0.5 sm:px-3 sm:py-1
                            text-xs font-bold sm:text-sm
                          "
                      >
                        🎯 {habit.records.length}回
                      </div>
                    </div>
                  </div>
                </div>

                {/* ボタン（今日やった・削除は横並びにする） */}
                <div className="flex flex-wrap gap-2">
                  {!doneToday && <TodayButton habitId={habit.id} />}

                  <DeleteButton id={habit.id} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 新規 */}
      <section className="game-panel">
        <h2 className="text-lg font-bold mb-2 sm:text-xl">➕ NEW QUEST</h2>

        <p className="mb-3 text-sm leading-relaxed sm:mb-4">
          小さな一歩からでも大丈夫！
        </p>

        <Link href="/habit/new" className="game-button inline-block">
          習慣を登録する
        </Link>
      </section>

      {/* 一覧 */}
      <section className="game-panel">
        <h2 className="text-lg font-bold mb-2 sm:text-xl">📚 QUEST LOG</h2>

        <p className="mb-3 text-sm leading-relaxed sm:mb-4">習慣一覧ページはこちら</p>

        <Link href="/habit" className="game-button inline-block">
          習慣一覧へ
        </Link>
      </section>

      {/* お問い合わせ */}
      <section className="game-panel">
        <h2 className="text-lg font-bold mb-2 sm:text-xl">💌 SUPPORT</h2>

        <p className="mb-3 text-sm leading-relaxed sm:mb-4">不具合・要望はこちら</p>

        <Link href="/contact" className="game-button inline-block">
          お問い合わせへ
        </Link>
      </section>
    </div>
  );
}
