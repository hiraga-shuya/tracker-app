import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

type SubscribeBody = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

// Web Push の購読を保存する（同じ endpoint があれば更新する）。
export async function POST(req: Request) {
  const userId = await getUserId();

  if (!userId) {
    return Response.json(
      { error: "ユーザー情報がありません" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as SubscribeBody;
  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return Response.json(
      { error: "購読情報が不足しています" },
      { status: 400 },
    );
  }

  await prisma.push_Subscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, p256dh, auth },
    update: { userId, p256dh, auth },
  });

  return Response.json({ success: true });
}

// 購読を解除する（この端末の endpoint の分だけ消す）。
export async function DELETE(req: Request) {
  const userId = await getUserId();

  if (!userId) {
    return Response.json(
      { error: "ユーザー情報がありません" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as { endpoint?: string };

  if (!body.endpoint) {
    return Response.json(
      { error: "購読情報が不足しています" },
      { status: 400 },
    );
  }

  await prisma.push_Subscription.deleteMany({
    where: { userId, endpoint: body.endpoint },
  });

  return Response.json({ success: true });
}
