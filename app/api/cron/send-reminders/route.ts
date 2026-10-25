import { prisma } from "@/lib/prisma";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import {
  getJstParts,
  getScheduledInstant,
  shouldSendReminder,
} from "@/lib/reminderSchedule";

// 定期実行から呼ばれて、予定時刻になったリマインダーを送信するAPI。
// GitHub Actions のスケジュール実行（数分おき）から、CRON_SECRET 付きで呼ばれる想定。
// 呼び出し側の遅延を吸収するため、予定時刻から60分以内なら送信し、
// 送信した予定日時は lastSentAt に記録して二重送信を防ぐ。
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      { error: "CRON_SECRET が設定されていません" },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return Response.json(
      { error: "通知機能は現在準備中です" },
      { status: 503 },
    );
  }

  const now = new Date();
  const parts = getJstParts(now);

  const reminders = await prisma.reminder.findMany({
    where: { is_active: true },
  });

  let sentCount = 0;

  for (const reminder of reminders) {
    if (!shouldSendReminder(reminder, now)) {
      continue;
    }

    await sendPushToUser(reminder.userId, {
      title: `🔔 ${reminder.title}`,
      body: reminder.body ?? "リマインダーの時間です",
      url: "/",
    });

    // 送信済みとして、この予定日時を記録する（次回の二重送信を防ぐ）
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        lastSentAt: getScheduledInstant(parts, reminder.hour, reminder.minute),
      },
    });

    sentCount++;
  }

  return Response.json({
    success: true,
    checked: reminders.length,
    sent: sentCount,
  });
}
