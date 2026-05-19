import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

export async function POST(req: Request) {
  const userId = await getUserId(); //cookieStoreから取得したUserIdを変数に格納

  if (!userId) {
    return new Response("Unauthorized", { status: 401 }); //cookieからuserIdが返ってこない場合、401を返す
  }

  const body = await req.json(); // DeleteButton.tsxからrequestが来た情報をbody変数に格納
  const id = body.id; //body変数に格納されている情報から、idカラムのデータをid変数に格納

  if (!id) {
    return new Response("Bad Request", { status: 400 }); //Habits_Taskのidが空の場合、400を返す
  }

  const result = await prisma.habit_Task.updateMany({
    //404処理を自分で書くためにupdateManyを使用
    where: {
      id,
      userId,
      deleted_at: null,
    }, //「idとuserId」が合致するものかつ、deleted_atがnullのデータを絞り込む
    data: {
      deleted_at: new Date(),
    }, //deleted_atに日時を付与し、論理削除を行う
  });

  if (result.count === 0) {
    return new Response("Not found", { status: 404 }); //result内のwhereで絞り込んだ結果、0件だった場合は404を返す
  }

  return Response.json({ success: true }); //成功したらフロント側にtrueを返す
}
