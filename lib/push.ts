import webpush from "web-push";

import { prisma } from "@/lib/prisma";

// Web Push の送信まわり（VAPID 鍵は環境変数で管理する）。
// VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY が未設定のときは「準備中」として扱い、
// 送信は行わない。

let configured = false;

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

function configure() {
  if (configured) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:vapid@example.com",
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );

  configured = true;
}

type PushPayload = {
  title: string;
  body?: string;
  url?: string;
};

// 指定したユーザーの全端末（購読）に通知を送る。
// 失効した購読（404 / 410）は次回のために削除する。
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  if (!isPushConfigured()) {
    return { sent: 0, failed: 0 };
  }

  configure();

  const subscriptions = await prisma.push_Subscription.findMany({
    where: { userId },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      );
      sent++;
    } catch (error) {
      failed++;

      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 404 || statusCode === 410) {
        await prisma.push_Subscription
          .delete({ where: { id: sub.id } })
          .catch(() => {});
      }
    }
  }

  return { sent, failed };
}
