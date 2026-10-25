// Web Push の購読に必要な VAPID 公開鍵を返す。
// 鍵は環境変数で管理し、ここでは公開鍵だけを返す（秘密鍵は出さない）。
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return Response.json(
      { error: "通知機能は現在準備中です" },
      { status: 503 },
    );
  }

  return Response.json({ publicKey });
}
