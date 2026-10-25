import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { validateReminderInput } from "@/app/api/reminders/route";

type UpdateBody = {
  id?: string;
  title?: string;
  body?: string | null;
  hour?: number;
  minute?: number;
  daysOfWeek?: number[];
  is_active?: boolean;
};

// リマインダーを更新する（有効・無効の切り替えだけでも使える）。
export async function POST(req: Request) {
  const userId = await getUserId();

  if (!userId) {
    return Response.json(
      { error: "ユーザー情報がありません" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as UpdateBody;

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

  // 内容の変更がある場合は、更新後の値でまとめてチェックする
  const hasContentChange =
    body.title !== undefined ||
    body.hour !== undefined ||
    body.minute !== undefined ||
    body.daysOfWeek !== undefined;

  if (hasContentChange) {
    const validationError = validateReminderInput({
      title: body.title ?? existing.title,
      hour: body.hour ?? existing.hour,
      minute: body.minute ?? existing.minute,
      daysOfWeek: body.daysOfWeek ?? existing.daysOfWeek,
    });

    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }
  }

  const reminder = await prisma.reminder.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.body !== undefined
        ? { body: body.body?.trim() ? body.body.trim() : null }
        : {}),
      ...(body.hour !== undefined ? { hour: body.hour } : {}),
      ...(body.minute !== undefined ? { minute: body.minute } : {}),
      ...(body.daysOfWeek !== undefined
        ? {
            daysOfWeek: [...new Set(body.daysOfWeek)].sort((a, b) => a - b),
          }
        : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
      // 時刻や曜日が変わったら、送信済みの記録はリセットする
      ...(hasContentChange ? { lastSentAt: null } : {}),
    },
  });

  return Response.json({ success: true, reminder });
}
