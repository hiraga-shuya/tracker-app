import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

import HabitCalendar from "@/components/HabitCalendar";

export default async function HabitCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const userId = await getUserId();

  if (!userId) {
    return <div>ユーザー情報がありません</div>;
  }

  const habit = await prisma.habit_Task.findFirst({
    where: {
      id,
      userId,
      deleted_at: null,
    },
    include: {
      records: true,
    },
  });

  if (!habit) {
    return <div>習慣タスクが見つかりません</div>;
  }

  // Date型へ変換
  const completedDates = habit.records.map((record) => {
    return new Date(record.date);
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* タイトル */}
      <div className="game-panel mb-6">
        <p className="text-sm tracking-[0.25em] text-gray-500 mb-2">
          ACHIEVEMENT CALENDAR
        </p>

        <h1 className="text-4xl font-black mb-3">{habit.name}</h1>

        <p className="text-lg text-gray-700">この習慣の達成履歴だ！</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div
            className="
              border-4 border-black
              bg-white
              px-4 py-2
              font-bold
            "
          >
            🏆 達成回数: {completedDates.length}
          </div>

          <div
            className="
              border-4 border-black
              bg-[#d8ffd8]
              px-4 py-2
              font-bold
            "
          >
            📅 継続を積み上げよう！
          </div>
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="game-panel">
        <div className="mb-4">
          <p className="text-sm tracking-widest text-gray-500">
            RECORD HISTORY
          </p>

          <h2 className="text-2xl font-black">達成記録カレンダー</h2>
        </div>

        <div
          className="
            border-4 border-black
            bg-white
            p-4
            overflow-x-auto
          "
        >
          <HabitCalendar completedDates={completedDates} />
        </div>

        {/* 凡例 */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-4 border-black bg-[#7ed957]" />

            <p className="font-bold text-sm">達成済み</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-4 border-black bg-white" />

            <p className="font-bold text-sm">未達成</p>
          </div>
        </div>
      </div>
    </div>
  );
}
