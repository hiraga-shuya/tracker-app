import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

import ReminderManager from "@/components/ReminderManager";

export default async function RemindersPage() {
  const userId = await getUserId();

  if (!userId) {
    return <div>ユーザー情報がありません</div>;
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: [{ hour: "asc" }, { minute: "asc" }, { created_at: "asc" }],
  });

  return (
    <div className="max-w-[700px] mx-auto space-y-4 sm:space-y-6">
      {/* タイトル */}
      <section className="game-panel">
        <p className="text-sm tracking-widest text-gray-600">REMINDERS</p>

        <h1 className="text-2xl font-bold mb-2 sm:text-3xl">通知リマインダー</h1>

        <p className="text-sm opacity-80 leading-relaxed">
          好きな時刻と曜日の組み合わせで、通知を受け取れます。習慣とは切り離した、自由に作れるリマインダーです。
        </p>
      </section>

      <ReminderManager
        initialReminders={reminders.map((r) => ({
          id: r.id,
          title: r.title,
          body: r.body,
          hour: r.hour,
          minute: r.minute,
          daysOfWeek: r.daysOfWeek,
          is_active: r.is_active,
        }))}
      />
    </div>
  );
}
