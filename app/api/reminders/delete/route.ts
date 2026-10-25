import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

// リマインダーを削除する。
export async function POST(req: Request) {
  const userId = await getUserId();

  if (!userId) {
    return Response.json(
      { error: "ユーザー情報がありません" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as { id?: string };

  if (!body.id) {
    return Response.json(
      { error: "リマインダーが指定されていません" },
      { status: 400 },
    );
  }

  const existing = await prisma.reminder.findFirst({
    where: { id: body.id, userId },
  });

  if (!existing) {
    return Response.json(
      { error: "リマインダーが見つかりません" },
      { status: 404 },
    );
  }

  await prisma.reminder.delete({
    where: { id: existing.id },
  });

  return Response.json({ success: true });
}
