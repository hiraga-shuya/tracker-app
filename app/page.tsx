import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { getHabitStreak } from "@/lib/getHabitStreak";

import { habitIcons } from "@/src/constants/habitIcons";
import { randomMessages } from "@/src/constants/messages";

import TodayButton from "@/components/TodayButton";
import DeleteButton from "@/components/DeleteButton";
import UserRegister from "@/components/UserRegister";

export default async function Home() {
  const userId = await getUserId();
  if (!userId) {
    //userIdが空なら、ユーザー登録画面を表示
    return <UserRegister />;
  }

  const today = new Date(); // 今日の日時をtoday変数に格納
  today.setHours(0, 0, 0, 0); //習慣タスクの完了は一日1回の制約を課すため、日時の"時刻"を0,0,0,0に変更

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
    <div className="space-y-6 pb-28">
      {/* タイトル */}
      <section className="game-panel">
        <p className="text-sm tracking-widest text-gray-600">DAILY QUEST</p>

        <h1 className="text-3xl font-bold mb-3">習慣化がんばるくん</h1>

        <p className="text-sm opacity-80 leading-relaxed">{randomMessage}</p>
      </section>

      {/* 習慣一覧 */}
      <section className="space-y-5">
        {habits.map((habit) => {
          const doneToday = habit.records.some((record) => {
            const d = new Date(record.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
          });

          const streak = getHabitStreak(habit.records);
          const iconData = habitIcons[habit.icon_type] ?? habitIcons.book;

          return (
            <div
              key={habit.id}
              className={`
                  game-panel
                  transition-all
                  hover:-translate-y-1
                `}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* 左 */}
                <div className="flex gap-4">
                  <figure
                    className="
                        w-16 h-16
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
                    />
                  </figure>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">ACTIVE QUEST</p>

                      <h2 className="text-2xl font-bold">{habit.name}</h2>
                    </div>

                    {/* ステータスバッジ */}
                    <div className="flex gap-2 flex-wrap">
                      <div
                        className={`
                            border-2 border-black
                            px-3 py-1
                            text-sm font-bold
                            ${doneToday ? "bg-[#c8e6c9]" : "bg-[#ffcdd2]"}
                          `}
                      >
                        {doneToday ? "✔ COMPLETE" : "⏳ IN PROGRESS"}
                      </div>

                      <div
                        className="
                            border-2 border-black
                            bg-[#bbdefb]
                            px-3 py-1
                            text-sm font-bold
                          "
                      >
                        🔥 {streak}日継続中
                      </div>

                      <div
                        className="
                            border-2 border-black
                            bg-[#dcedc8]
                            px-3 py-1
                            text-sm font-bold
                          "
                      >
                        🎯 {habit.records.length}回
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右ボタン */}
                <div className="flex flex-col gap-2">
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
        <h2 className="text-xl font-bold mb-2">➕ NEW QUEST</h2>

        <p className="mb-4 text-sm leading-relaxed">
          小さな一歩からでも大丈夫！
        </p>

        <Link href="/habit/new" className="game-button inline-block">
          習慣を登録する
        </Link>
      </section>

      {/* 一覧 */}
      <section className="game-panel">
        <h2 className="text-xl font-bold mb-2">📚 QUEST LOG</h2>

        <p className="mb-4 text-sm leading-relaxed">習慣一覧ページはこちら</p>

        <Link href="/habit" className="game-button inline-block">
          習慣一覧へ
        </Link>
      </section>

      {/* お問い合わせ */}
      <section className="game-panel">
        <h2 className="text-xl font-bold mb-2">💌 SUPPORT</h2>

        <p className="mb-4 text-sm leading-relaxed">不具合・要望はこちら</p>

        <Link href="/contact" className="game-button inline-block">
          お問い合わせへ
        </Link>
      </section>
    </div>
  );
}
