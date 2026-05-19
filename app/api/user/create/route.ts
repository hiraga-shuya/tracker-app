import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string }; //req.json()で送られてきたJSONを取得し、{ name?: string } 型としてbody変数に格納

  if (!body.name?.trim()) {
    //nameが空なら400を返す
    return new Response("Name is required", { status: 400 });
  }

  const name = body.name.trim();
  const userId = crypto.randomUUID(); //ランダムなIDをuserIdに返す

  await prisma.user.create({
    data: {
      id: userId,
      name,
    }, // Userテーブルにidとnameが入ったレコードを登録
  });

  const cookieStore = await cookies(); //cookieに対して値をセットするため、cookieStore変数にcookieの情報を格納

  cookieStore.set("userId", userId, {
    // cookieに「userId=xxxx」のような形で保存してもらっている
    httpOnly: true, //JSでcookieを触れないように
    path: "/", //サイト全体でcookieを使用する
    maxAge: 60 * 60 * 24 * 365, //1年間cookieを保持
  });

  return Response.json({ success: true });
}
