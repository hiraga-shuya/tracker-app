import { getUserId } from "@/lib/getUserId";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import { prisma } from "@/lib/prisma";

// テスト通知を自分の端末に送る（設定が正しくできたか確認するため）。
export async function POST() {
  const userId = await getUserId();

  if (!userId) {
    return Response.json(
      { error: "ユーザー情報がありません" },
      { status: 401 },
    );
  }

  if (!isPushConfigured()) {
    return Response.json(
      { error: "通知機能は現在準備中です" },
      { status: 503 },
    );
  }

  const subscriptionCount = await prisma.push_Subscription.count({
    where: { userId },
  });

  if (subscriptionCount === 0) {
    return Response.json(
      { error: "この端末はまだ通知を受け取る設定になっていません" },
      { status: 400 },
    );
  }

  const result = await sendPushToUser(userId, {
    title: "🔔 テスト通知",
    body: "通知が届いています。リマインダーの設定は正常です！",
    url: "/reminders",
  });

  return Response.json({ success: true, ...result });
}
