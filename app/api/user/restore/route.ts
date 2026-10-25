import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// 復旧コード（＝ユーザーID）を使って、ブラウザを変えた・初期化した・
// PWAに移ったなどの場合でも、今までのデータを引き継いで再開するためのAPI。
// コードが正しければ、登録時と同じ Cookie をこの環境にセットし直す。
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string };
    const code = body.code?.trim();

    if (!code) {
      return Response.json(
        { error: "復旧コードを入力してください" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: code,
      },
    });

    if (!user) {
      return Response.json(
        { error: "復旧コードが正しくありません" },
        { status: 404 },
      );
    }

    const cookieStore = await cookies();

    // 登録時（POST /api/user/create）と同じ条件で Cookie をセットする
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1年間保持
    });

    return Response.json({ success: true, name: user.name });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "復旧に失敗しました" },
      { status: 500 },
    );
  }
}
