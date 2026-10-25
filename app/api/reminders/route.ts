import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

type ReminderBody = {
  title?: string;
  body?: string | null;
  hour?: number;
  minute?: number;
  daysOfWeek?: number[];
};

// リマインダーの入力チェック。問題があればエラーメッセージを返す。
export function validateReminderInput(body: ReminderBody): string | null {
  if (!body.title || body.title.trim() === "") {
    return "タイトルを入力してください";
  }

  if (body.title.length > 100) {
    return "タイトルは100文字以内にしてください";
  }

  if (
    typeof body.hour !== "number" ||
    body.hour < 0 ||
    body.hour > 23 ||
    !Number.isInteger(body.hour)
  ) {
    return "時刻（時）が正しくありません";
  }

  if (
    typeof body.minute !== "number" ||
    body.minute < 0 ||
    body.minute > 59 ||
    !Number.isInteger(body.minute)
  ) {
    return "時刻（分）が正しくありません";
  }

  if (
    !Array.isArray(body.daysOfWeek) ||
    body.daysOfWeek.length === 0 ||
    body.daysOfWeek.some(
      (d) => !Number.isInteger(d) || d < 0 || d > 6,
    )
  ) {
    return "曜日を1つ以上選んでください";
  }

  return null;
}

// リマインダーを新規作成する。
export async function POST(req: Request) {
  const userId = await getUserId();

  if (!userId) {
    return Response.json(
      { error: "ユーザー情報がありません" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as ReminderBody;

  const validationError = validateReminderInput(body);

  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      title: (body.title as string).trim(),
      body: body.body?.trim() ? body.body.trim() : null,
      hour: body.hour as number,
      minute: body.minute as number,
      daysOfWeek: [...new Set(body.daysOfWeek as number[])].sort(
        (a, b) => a - b,
      ),
    },
  });

  return Response.json({ success: true, reminder });
}
