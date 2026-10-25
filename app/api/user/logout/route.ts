import { cookies } from "next/headers";

// ログアウト用API。この端末の Cookie（userId）を消して未登録の状態に戻す。
// データ自体はDBに残っているので、復旧コードを使えば再び引き継げる。
export async function POST() {
  const cookieStore = await cookies();

  // 登録時と同じ条件で、値を空にして有効期限を 0 にすることで削除する
  cookieStore.set("userId", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return Response.json({ success: true });
}
